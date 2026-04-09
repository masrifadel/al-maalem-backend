import Category from "../models/Category.js";
import { bufferToDataUrl } from "../middleware/upload.js";

// GET ALL: Public (For Navbar/Sidebar)
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.status(200).json(categories);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching categories: " + error.message });
  }
};

// GET ONE: Find specific category by ID
export const getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST: Create new category (Admin Only)
export const createCategory = async (req, res) => {
  const { name, path } = req.body;

  // Handle memory storage - convert to base64
  let imageUrl = "";
  if (req.file) {
    console.log("=== MEMORY UPLOAD ===");
    console.log("File received:", req.file.originalname);
    console.log("File size:", req.file.size);
    console.log("Mimetype:", req.file.mimetype);

    imageUrl = bufferToDataUrl(req.file.buffer, req.file.mimetype);
    console.log("Converted to data URL, length:", imageUrl.length);
    console.log("=== MEMORY UPLOAD COMPLETE ===");
  }

  try {
    const newCategory = new Category({ name, path, imageUrl });
    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    res.status(400).json({ message: "Validation failed: " + error.message });
  }
};

// PUT: Update category name and image (Admin Only)
export const updateCategory = async (req, res) => {
  try {
    const updateData = {
      name: req.body.name,
      path: req.body.path,
    };

    // Handle memory storage - convert to base64
    if (req.file) {
      console.log("=== MEMORY UPLOAD UPDATE ===");
      console.log("File received:", req.file.originalname);
      console.log("File size:", req.file.size);
      console.log("Mimetype:", req.file.mimetype);

      updateData.imageUrl = bufferToDataUrl(req.file.buffer, req.file.mimetype);
      console.log("Converted to data URL, length:", updateData.imageUrl.length);
      console.log("=== MEMORY UPLOAD UPDATE COMPLETE ===");
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true },
    );
    if (!updatedCategory)
      return res.status(404).json({ message: "Category not found" });
    res.status(200).json(updatedCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE: Remove category (Admin Only)
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
