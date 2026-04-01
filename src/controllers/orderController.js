import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import User from "../models/User.js";

export const createOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const { shippingAddress, items } = req.body;
    console.log("shippingAddress", shippingAddress);
    console.log("items", items);

    // Find the cart and "populate" the product details
    let cart = await Cart.findOne({ userId }).populate({
      path: "items.product",
      select: "name price url description", // Only fetch what's UI needs
    });

    if (!cart || cart.items.length === 0) {
      return res.status(404).json({ message: "Cart not found or empty" });
    }

    let totalAmount = 0;
    const orderItems = [];

    // SAFETY CHECK: Ensure that product actually exists after populate
    for (const item of cart.items) {
      if (item.product) {
        orderItems.push({
          productId: item.product._id,
          quantity: item.quantity,
          priceAtPurchase: item.product.price,
        });
        totalAmount += item.product.price * item.quantity;
      }
    }

    if (orderItems.length === 0) {
      return res.status(404).json({ message: "No valid items in cart" });
    }

    // Create the order
    const order = new Order({
      userId: userId,
      items: orderItems,
      shippingAddress,
      totalAmount,
    });

    const savedOrder = await order.save();
    const populatedOrder = await savedOrder.populate("items.product");

    // Clear the cart after successful order
    await Cart.findOneAndUpdate({ userId }, { $unset: { items: 1 } });

    res.status(201).json(populatedOrder);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating order", error: error.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const userId = req.userId; // From my auth middleware

    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .populate("items.productId", "name url"); // Get product details for the UI

    res.status(200).json(orders);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching orders: " + error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .populate("userId", "name email") // Get user details
      .populate("items.productId", "name url price"); // Get product details

    res.status(200).json(orders);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching all orders: " + error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Pending", "Paid"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findByIdAndUpdate(id, { status }, { new: true })
      .populate("userId", "name email")
      .populate("items.productId", "name url price");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating order status: " + error.message });
  }
};

export const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    console.log("Requested Order ID:", id);
    console.log("Authenticated User ID:", req.userId);

    // Find the order by ID AND ensure it belongs to this user
    const order = await Order.findOne({ _id: id, userId }).populate(
      "items.productId",
      "name price url description",
    );

    if (!order) {
      return res
        .status(404)
        .json({ message: "Order not found or unauthorized" });
    }

    res.status(200).json(order);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching order details: " + error.message });
  }
};
