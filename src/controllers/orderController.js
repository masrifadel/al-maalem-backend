import Order from "../models/Order.js";
import User from "../models/User.js";

export const createOrder = async (req, res) => {
  try {
    // Create random user ID for each order
    const randomUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const userId = req.userId || randomUserId;
    const { shippingAddress, items } = req.body;
    console.log("Order data:", { shippingAddress, items });

    // Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Items should be a non-empty array" });
    }

    let totalAmount = 0;
    const orderItems = [];

    // Process items directly from request (no cart needed)
    for (const item of items) {
      console.log("Processing order item:", item);
      orderItems.push({
        productId: item._id || item.productId,
        quantity: item.quantity,
        priceAtPurchase: item.price,
      });
      totalAmount += item.price * item.quantity;
    }

    if (orderItems.length === 0) {
      return res.status(400).json({ message: "No valid items in order" });
    }

    // Create the order
    const order = new Order({
      userId: userId,
      items: orderItems,
      shippingAddress,
      totalAmount,
    });

    const savedOrder = await order.save();
    const populatedOrder = await savedOrder.populate("items.productId");

    // No cart clearing needed since we're not using cart anymore
    console.log("✅ Order created successfully for user:", userId);

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
      .populate("items.productId", "name url price"); // Get product details

    // Enhance orders with user information from shipping address for guest users
    const enhancedOrders = orders.map((order) => {
      const orderObj = order.toObject();

      // If userId starts with 'user_', it's a guest user
      if (order.userId && order.userId.startsWith("user_")) {
        orderObj.userInfo = {
          name: order.shippingAddress.name,
          phone: order.shippingAddress.phoneNumber,
          email: "guest@example.com",
          isGuest: true,
        };
      } else {
        // For authenticated users, populate user details
        orderObj.userInfo = {
          name: "Admin User",
          email: "admin@example.com",
          isGuest: false,
        };
      }

      return orderObj;
    });

    res.status(200).json(enhancedOrders);
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
