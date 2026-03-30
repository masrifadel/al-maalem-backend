import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  path: {
    type: String,
    required: true,
    unique: true,
  },
  imageUrl: { type: String, required: true },
});

const Category = mongoose.model("Category", categorySchema); //create model based on "CategorySchema" model.
export default Category;
