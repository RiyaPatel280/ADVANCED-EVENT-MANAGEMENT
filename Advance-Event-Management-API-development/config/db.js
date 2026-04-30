import mongoose from "mongoose";

export const connectDB = () => {
  mongoose.connect('mongodb://localhost:27017/demo')
    .then(() => console.log("✅ DB Connected"))
    .catch((error) => {
      console.error("DB Connection Failed:", error.message);
      process.exit(1); // Exit the process with a failure code
    });
};
