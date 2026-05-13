import mongoose from "mongoose";
import { Schema } from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  originalPrice: {
    type: Number,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  available: {
    type: Boolean,
    required: true,
    default: true,
  },
  url: {
    type: String,
    required: true,
    comment:
      "Base64 data URL for product image (e.g., data:image/jpeg;base64,...)",
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  isFeatured: { type: Boolean, default: false },
});

const Product = mongoose.model("Product", productSchema); //create model based on "Product" model.
export default Product;
