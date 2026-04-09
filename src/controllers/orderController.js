import Order from "../models/Order.js";

export const createOrder = async (req, res) => {
  try {
    console.log("🛒 ORDER CREATION STARTED");
    console.log("📥 Request body:", req.body);
    console.log("📥 Request headers:", req.headers);

    // Create random user ID for guest orders
    const randomUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const userId = req.userId || randomUserId;
    const { shippingAddress, items } = req.body;

    console.log("👤 User ID being used:", userId);
    console.log("📦 Shipping address:", shippingAddress);
    console.log("🛒 Items count:", items?.length || 0);

    // Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      console.log("❌ Invalid items array");
      return res
        .status(400)
        .json({ message: "Items should be a non-empty array" });
    }

    let totalAmount = 0;
    const orderItems = [];

    // Process items directly from request (no cart needed)
    for (const item of items) {
      console.log("📦 Processing item:", item);
      orderItems.push({
        productId: item._id || item.productId,
        quantity: item.quantity,
        priceAtPurchase: item.price,
      });
      totalAmount += item.price * item.quantity;
    }

    if (orderItems.length === 0) {
      console.log("❌ No valid items in order");
      return res.status(400).json({ message: "No valid items in order" });
    }

    console.log("💰 Total amount calculated:", totalAmount);
    console.log("🛒 Order items prepared:", orderItems.length);

    // Create order - skip ObjectId validation for guest users
    const order = new Order({
      userId: userId, // Keep as string for guest orders
      items: orderItems,
      shippingAddress,
      totalAmount,
    });

    console.log("📋 Order object created:", order);

    const savedOrder = await order.save();
    console.log("💾 Order saved to database:", savedOrder._id);

    const populatedOrder = await Order.findById(savedOrder._id)
      .populate("items.productId")
      .lean(); // Convert to plain JS object

    console.log("🔍 Order populated:", populatedOrder);
    console.log("🎯 Final order data:", {
      _id: populatedOrder._id,
      userId: populatedOrder.userId,
      itemsCount: populatedOrder.items?.length || 0,
      totalAmount: populatedOrder.totalAmount,
    });

    res.status(201).json(populatedOrder);
    console.log("✅ Order response sent with _id:", populatedOrder._id);
  } catch (error) {
    console.error("❌ Order creation error:", error);
    res
      .status(500)
      .json({ message: "Error creating order", error: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .populate("items.productId", "name url price"); // Get product details
    // Note: Don't populate userId here - handle it manually in the mapping

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
          name: order.shippingAddress?.name || "Unknown Customer",
          phone: order.shippingAddress?.phoneNumber || "Unknown Phone",
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
