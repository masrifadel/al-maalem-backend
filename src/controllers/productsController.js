import Product from "../models/Product.js";
import fs from "fs";
import path from "path";

export const getAllProducts = async (_, res) => {
  try {
    const products = await Product.find({})
      .sort({ createdAt: -1 })
      .populate("categoryId"); // newest first
    res.status(200).json({ products });
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
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : "";

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

    if (req.file) {
      // If a new file is uploaded, set the new path
      imageUrl = `/uploads/${req.file.filename}`;

      // OPTIONAL: Delete the old physical file from the server to save space
      if (existingProduct.url) {
        const oldPath = path.join(process.cwd(), existingProduct.url);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
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
