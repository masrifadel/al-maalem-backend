//mongoose
import mongoose from "mongoose";

const mongodbConn = async () => {
  try {
    await mongoose.connect(`mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0-maalem.ajlheer.mongodb.net/?appName=Cluster0-maalem`);
    console.log("Database connected");
  } catch (error) {
    console.log("Error in connecting to Database", error.message);
    process.exit(1);
  }
};
export default mongodbConn;
