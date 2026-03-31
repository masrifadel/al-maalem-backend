import bcrypt from "bcryptjs";

// Generate hashed password for "password"
const generateHash = async () => {
  const password = "password";
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log("Hashed password for 'password':");
  console.log(hashedPassword);
  return hashedPassword;
};

generateHash().catch(console.error);
