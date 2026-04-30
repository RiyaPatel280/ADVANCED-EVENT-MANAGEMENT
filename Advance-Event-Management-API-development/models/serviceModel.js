import mongoose from "mongoose";

const ServiceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  options: [
    {
      tier: String,
      price: Number,
    },
  ],
  addBy: { type: String, required: true }, // Store email of the user who added the service
});

export default mongoose.model("Service", ServiceSchema);
