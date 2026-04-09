import Product from "../models/Product.js";
import { bufferToDataUrl } from "../middleware/upload.js";

export const getAllProducts = async (_, res) => {
  try {
    const products = await Product.find({})
      .sort({ createdAt: -1 })
      .populate("categoryId"); // newest first
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getOneProduct = async (req, res) => {
  const id = req.params.id;
  try {
    const oneProduct = await Product.findById(id);
    res.status(200).json(oneProduct);
  } catch (error) {
    console.log(error);
    res.status(200).json({
      message: "Internal server error",
    });
  }
};

export const getFeaturedProducts = async (_, res) => {
  try {
    const products = await Product.find({ isFeatured: true, available: true })
      .limit(5)
      .sort({ createdAt: -1 })
      .populate("categoryId"); // newest first
    if (!products) {
      return res.status(201).json([]);
    }
    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addProduct = async (req, res) => {
  const {
    name,
    originalPrice,
    price,
    description,
    available,
    isFeatured,
    categoryId,
  } = req.body;

  // Handle memory storage - convert to base64
  let imageUrl = "";
  if (req.file) {
    console.log("=== MEMORY UPLOAD PRODUCT ===");
    console.log("File received:", req.file.originalname);
    console.log("File size:", req.file.size);
    console.log("Mimetype:", req.file.mimetype);

    imageUrl = bufferToDataUrl(req.file.buffer, req.file.mimetype);
    console.log("Converted to data URL, length:", imageUrl.length);
    console.log("=== MEMORY UPLOAD PRODUCT COMPLETE ===");
  }

  try {
    // Validate required fields
    if (!name || !price || !description || !categoryId) {
      return res.status(400).json({
        message:
          "Missing required fields: name, price, description, categoryId",
      });
    }

    // Convert string values to proper types
    const productData = {
      name,
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      price: parseFloat(price),
      description,
      available: available === "true" || available === true,
      url: imageUrl || "/placeholder.png", // Provide default if no image
      categoryId,
      isFeatured: isFeatured === "true" || isFeatured === true,
    };

    const newProduct = new Product(productData);
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateProduct = async (req, res) => {
  const Id = req.params.id;
  const { name, originalPrice, price, description, available, categoryId } =
    req.body;
  try {
    const existingProduct = await Product.findById(Id);
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    let imageUrl = existingProduct.url;

    // Handle memory storage - convert to base64
    if (req.file) {
      console.log("=== MEMORY UPLOAD PRODUCT UPDATE ===");
      console.log("File received:", req.file.originalname);
      console.log("File size:", req.file.size);
      console.log("Mimetype:", req.file.mimetype);

      imageUrl = bufferToDataUrl(req.file.buffer, req.file.mimetype);
      console.log("Converted to data URL, length:", imageUrl.length);
      console.log("=== MEMORY UPLOAD PRODUCT UPDATE COMPLETE ===");
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      Id,
      {
        name,
        originalPrice,
        price,
        description,
        available,
        url: imageUrl,
        categoryId,
      },
      { new: true, runValidators: true },
    );
    await res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteProduct = async (req, res) => {
  const Id = req.params.id;
  try {
    await Product.findByIdAndDelete(Id);
    res.status(200).json("Product deleted successfully!");
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
};
