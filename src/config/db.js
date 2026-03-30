//mongoose
import mongoose from "mongoose";

const mongodbConn = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Database connected");
  } catch (error) {
    console.log("Error in connecting to Database", error.message);
    process.exit(1);
  }
};
export default mongodbConn;
