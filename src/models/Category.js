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
  imageUrl: {
    type: String,
    required: true,
    comment:
      "Base64 data URL for category image (e.g., data:image/jpeg;base64,...)",
  },
});

const Category = mongoose.model("Category", categorySchema); //create model based on "CategorySchema" model.
export default Category;
