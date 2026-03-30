import Cart from "../models/Cart.js";
export const mergeToCart = async (req, res) => {
  try {
    const { items } = req.body;
    const userId = req.userId;
    if (!Array.isArray(items)) {
      return res.status(400).json({ message: "Items should be an array" });
    }
    let cart = await Cart.findOne({ userId });
    const guestItems = items.map((item) => ({
      product: item._id,
      quantity: item.quantity,
    }));
    if (!cart) {
      cart = new Cart({
        userId: userId,
        items: guestItems,
      });
    } else {
      guestItems.forEach((guestItem) => {
        const existingItemIndex = cart.items.findIndex(
          (item) =>
            item.product &&
            item.product.toString() === guestItem.product.toString(),
        );

        if (existingItemIndex > -1) {
          cart.items[existingItemIndex].quantity += guestItem.quantity;
        } else {
          cart.items.push(guestItem);
        }
      });
    }
    await cart.save();
    const updatedCart = await Cart.findById(cart._id).populate(
      "items.product",
      "name price url description",
    );
    res.status(200).json({
      message: "Cart Synced successfully",
      cart: updatedCart,
    });
  } catch (err) {
    console.error("Merge Error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const addOneProductToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.userId;
  try {
    let cart = await Cart.findOne({ userId });
    if (cart) {
      const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId,
      );
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ product: productId, quantity });
      }
      cart = await cart.save();
    } else {
      cart = await Cart.create({
        userId,
        items: [{ product: productId, quantity }],
      });
    }
    const updatedCart = await Cart.findById(cart._id).populate(
      "items.product",
      "name price url description",
    );
    res.status(200).json({ cart: updatedCart });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
    console.log(err);
  }
};

export const UpdateQuantity = async (req, res) => {
  try {
    const { productId, action } = req.body;
    const userId = req.userId;

    let cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId,
    );

    if (itemIndex > -1) {
      if (action === "increment") {
        cart.items[itemIndex].quantity += 1;
      } else if (action === "decrement") {
        cart.items[itemIndex].quantity -= 1;
        if (cart.items[itemIndex].quantity <= 0) {
          cart.items[itemIndex].quantity = 1;
        }
      } else if (action === "delete") {
        cart.items.splice(itemIndex, 1);
      }
      await cart.save();
      const populatedCart = await cart.populate("items.product");
      return res.status(200).json({ cart: populatedCart });
    } else {
      return res.status(404).json({ message: "Item not in the Cart" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// controllers/cartController.js

export const getCart = async (req, res) => {
  try {
    const userId = req.userId;

    // Find the cart and "populate" the product details
    const cart = await Cart.findOne({ userId }).populate({
      path: "items.product",
      select: "name price url description", // Only fetch what the UI needs
    });

    if (!cart) {
      // If no cart exists yet, return an empty array instead of an error
      return res.status(200).json({ items: [] });
    }

    res.status(200).json({ cart });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching cart", error: error.message });
  }
};
