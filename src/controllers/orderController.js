import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import User from "../models/User.js";

export const createOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const { shippingAddress, items } = req.body;
    console.log("shippingAddress", shippingAddress);
    console.log("items", items);

    // Handle both cases: with items (guest checkout) and without items (user logged in)
    if (items && items.length > 0) {
      // Guest checkout with items
      let totalAmount = 0;
      const orderItems = items.map((item) => ({
        productId: item._id,
        quantity: item.quantity,
        priceAtPurchase: item.price,
      }));

      const order = new Order({
        userId,
        items: orderItems,
        shippingAddress,
        totalAmount: orderItems.reduce((sum, item) => sum + item.priceAtPurchase * item.quantity, 0),
      status: "Pending",
    });

    const savedOrder = await newOrder.save();

    // Clear the cart only AFTER the order is successfully saved
    await Cart.findOneAndDelete({ userId });

    // Signal to admin panel that a new order was created using WebSocket
    const wss = req.app.get("wss");
    if (wss) {
      const orderData = {
        orderId: savedOrder._id,
        customerName: shippingAddress.saveAddress
          ? `${shippingAddress.building}, Floor ${shippingAddress.floor}`
          : "Customer",
        totalAmount,
        status: "Pending",
        createdAt: new Date(),
      };

      broadcastOrderUpdate(orderData);
    } else {
      // Fallback to localStorage if WebSocket is not available
      localStorage.setItem("orders-updated", Date.now().toString());
    }

    // Also trigger admin panel to refresh orders
    setTimeout(() => {
      localStorage.setItem("orders-updated", Date.now().toString());
    }, 100);

    res.status(201).json({
      message: "Order placed successfully",
      order: savedOrder,
    });
  } catch (error) {
    // Corrected string concatenation
    res
      .status(500)
      .json({ message: "Internal server error: " + error.message });
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
