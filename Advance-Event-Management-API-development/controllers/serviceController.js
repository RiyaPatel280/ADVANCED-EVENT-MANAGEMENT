import Service from "../models/serviceModel.js";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
// Add a new service
export const addService = async (req, res) => {
  try {
    const { name, price, options } = req.body;
    const addBy = req.user.email; // Extract email from token

    const newService = new Service({ name, price, options, addBy });
    await newService.save();

    res.status(201).json({
      success: true,
      message: "Service added successfully!",
      service: newService,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add service.",
      error,
    });
  }
};


export const verifyToken = (req, res, next) => {
  console.log("🔥 Received Headers:", req.headers); // Log request headers

  const authHeader = req.header("Authorization");
  if (!authHeader) {
    console.log("🚨 No Authorization header received!");
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1]; // Extract token
  console.log("🛠 Extracted Token:", token); // Debug token

  if (!token) {
    console.log("🚨 Token missing from Authorization header!");
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Decoded Token:", decoded);
    req.user = decoded; // Attach user to request
    next();
  } catch (error) {
    console.error("❌ JWT Verification Error:", error.message);
    res.status(403).json({ message: "Invalid token" });
  }
};

// Get all services
// export const getAllServices = async (req, res) => {
//   try {
//     const services = await Service.find();
//     console.log("Fetched services:", services); // Debugging log
//     res.status(200).json({ services }); // Wrap in an object
//   } catch (error) {
//     console.error("Error fetching services:", error);
//     res.status(500).json({ success: false, message: "Failed to fetch services.", error });
//   }
// };

export const getVenueOptions = async (req, res) => {
  try {
    const services = await Service.find().select("options");
    res.status(200).json({ success: true, options: services.map(service => service.options) });
  } catch (error) {
    console.error("Error fetching venue options:", error);
    res.status(500).json({ success: false, message: "Failed to fetch venue options.", error });
  }
};


export const getAllServices = async (req, res) => {
  try {
    let { addBy } = req.query; // Expecting name (e.g., "riya")
    console.log("Query addBy (name):", addBy);

    // Dynamically map name to email
    if (addBy) {
      const user = await userModel.findOne({ name: addBy }).select("email");
      if (user) {
        addBy = user.email; // Convert "riya" to "riya@gmail.com"
        console.log("Mapped to email:", addBy);
      } else {
        console.log("No user found for name:", addBy);
        return res.status(200).json({ success: true, services: [] }); // No services if organizer not found
      }
    }

    let query = {};
    if (addBy) {
      query.addBy = addBy; // Filter by email
    }
    const services = await Service.find(query).select("name price addBy options.tier options.price");
    console.log("Filtered services:", services);
    res.status(200).json({ success: true, services });
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ success: false, message: "Failed to fetch services.", error });
  }
};

export const getServices = async (req, res) => {
  try {
    const services = await Service.find();
    
    // Fetch user names for each service
    const servicesWithNames = await Promise.all(
      services.map(async (service) => {
        const user = await userModel.findOne({ email: service.addBy });
        return {
          ...service.toObject(),
          addedByName: user ? user.name : "Unknown", // Replace email with name
        };
      })
    );

    res.status(200).json(servicesWithNames);
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ success: false, message: "Failed to fetch services.", error });
  }
};



// Get a single service by ID
export const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: "Service not found" });

    res.status(200).json({ success: true, service });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch service.", error });
  }
};

// Update a service
export const updateService = async (req, res) => {
  try {
    console.log("Received ID:", req.params.id);
    console.log("Request Body:", req.body);

    if (!req.params.id || req.params.id.length !== 24) {
      return res.status(400).json({ success: false, message: "Invalid ID format" });
    }

    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ success: false, message: "Request body is empty. Nothing to update." });
    }

    const serviceExists = await Service.findById(req.params.id);
    if (!serviceExists) {
      return res.status(404).json({ success: false, message: "Service not found in the database." });
    }

    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, message: "Service updated successfully!", service: updatedService });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Failed to update service.", error });
  }
};




// Delete a service
export const deleteService = async (req, res) => {
  try {
    const deletedService = await Service.findByIdAndDelete(req.params.id);
    if (!deletedService) return res.status(404).json({ success: false, message: "Service not found" });

    res.status(200).json({ success: true, message: "Service deleted successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete service.", error });
  }
};
