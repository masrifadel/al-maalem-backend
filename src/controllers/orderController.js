import Order from "../models/Order.js";

export const createOrder = async (req, res) => {
  try {
    // Create random user ID for guest orders
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

    // Create order - skip ObjectId validation for guest users
    const order = new Order({
      userId: userId, // Keep as string for guest orders
      items: orderItems,
      shippingAddress,
      totalAmount,
    });

    const savedOrder = await order.save();
    const populatedOrder = await Order.findById(savedOrder._id)
      .populate("items.productId")
      .lean(); // Convert to plain JS object

    console.log(" Order created successfully for user:", userId);

    res.status(201).json(populatedOrder);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating order", error: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .populate("userId", "name email role") // Get admin user details
      .populate("items.productId", "name url price"); // Get product details

    // Enhance orders with user information
    const enhancedOrders = orders.map((order) => {
      const orderObj = order.toObject();

      // Check if userId is a valid MongoDB ObjectId (admin order) or string (guest order)
      if (
        order.userId &&
        typeof order.userId === "object" &&
        order.userId._id
      ) {
        // Admin user order - populate from User model
        orderObj.userInfo = {
          name: order.userId.name,
          email: order.userId.email,
          role: order.userId.role,
          isGuest: false,
        };
      } else if (order.userId === "admin_user") {
        // Admin token order - use admin user info
        orderObj.userInfo = {
          name: "Admin User",
          email: "maalem@example.com",
          role: "admin",
          isGuest: false,
        };
      } else {
        // Guest user order - use shipping address info
        orderObj.userInfo = {
          name: order.shippingAddress.name,
          phone: order.shippingAddress.phoneNumber,
          email: "guest@example.com",
          isGuest: true,
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

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate("items.productId", "name url price")
      .lean();

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Enhance order with user information
    const enhancedOrder = { ...order };

    if (order.userId && typeof order.userId === "object" && order.userId._id) {
      // Admin user order - populate from User model
      enhancedOrder.userInfo = {
        name: order.userId.name,
        email: order.userId.email,
        role: order.userId.role,
        isGuest: false,
      };
    } else {
      // Guest user order - use shipping address info
      enhancedOrder.userInfo = {
        name: order.shippingAddress.name,
        phone: order.shippingAddress.phoneNumber,
        email: "guest@example.com",
        isGuest: true,
      };
    }

    res.status(200).json(enhancedOrder);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching order", error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Pending", "Paid"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    ).populate("items.productId", "name url price");

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
