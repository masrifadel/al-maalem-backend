import bcrypt from "bcryptjs";

const generateHash = async () => {
  try {
    const password = "password";
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Hashed password for 'password':");
    console.log(hashedPassword);
    console.log("Copy this hash for MongoDB Atlas");
    return hashedPassword;
  } catch (error) {
    console.error("Error generating hash:", error);
  }
};

generateHash();
