import Category from "../models/Category.js";
import Product from "../models/Product.js";

export const seedData = async () => {
  try {
    // Check if categories exist
    const categoriesCount = await Category.countDocuments();
    if (categoriesCount === 0) {
      // Create sample categories
      const categories = [
        { name: "Grilled Sandwiches", path: "grilled-sandwiches", imageUrl: "/uploads/grilled-sandwiches.jpg" },
        { name: "Burgers", path: "burgers", imageUrl: "/uploads/burgers.jpg" },
        { name: "Plates", path: "plates", imageUrl: "/uploads/plates.jpg" },
        { name: "Drinks", path: "drinks", imageUrl: "/uploads/drinks.jpg" },
      ];

      await Category.insertMany(categories);
      console.log("✅ Sample categories created");
    }

    // Check if products exist
    const productsCount = await Product.countDocuments();
    if (productsCount === 0) {
      // Get categories
      const grilledCategory = await Category.findOne({ path: "grilled-sandwiches" });
      const burgersCategory = await Category.findOne({ path: "burgers" });
      const platesCategory = await Category.findOne({ path: "plates" });

      // Create sample products
      const products = [
        {
          name: "Grilled Chicken Sandwich",
          description: "Charcoal-grilled chicken breast with special sauce",
          price: 12000,
          categoryId: grilledCategory?._id,
          available: true,
          isFeatured: true,
          url: "/uploads/chicken-sandwich.jpg"
        },
        {
          name: "Classic Beef Burger",
          description: "Juicy beef patty with lettuce, tomato, and our special sauce",
          price: 15000,
          categoryId: burgersCategory?._id,
          available: true,
          isFeatured: true,
          url: "/uploads/beef-burger.jpg"
        },
        {
          name: "Mixed Grill Plate",
          description: "Assorted grilled meats with rice and salad",
          price: 25000,
          categoryId: platesCategory?._id,
          available: true,
          isFeatured: false,
          url: "/uploads/mixed-grill.jpg"
        }
      ];

      await Product.insertMany(products);
      console.log("✅ Sample products created");
    }

    console.log("🎉 Database seeding completed!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
};
