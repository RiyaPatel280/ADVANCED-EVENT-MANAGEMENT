import EventCategory from "../models/EventCategory.js";
import userModel from "../models/userModel.js"; // Ensure correct import
import multer from "multer";

// ✅ Set up Multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Ensure 'uploads/' directory exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// ✅ Create Category with Image
// export const createCategory = async (req, res) => {
//   try {
//     const { title, description, startDate, venue, details, price } = req.body;
//     const image = req.file ? req.file.path : null;

//     if (!req.user) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     if (req.user.role !== "organizer" && req.user.role !== "admin") {
//       return res.status(403).json({ message: "Only organizers or admins can create categories" });
//     }
    

//     const newCategory = new EventCategory({ 
//       title, description, startDate, venue, details, price, image, organizer: req.user.name 
//     });

//     await newCategory.save();
//     res.status(201).json({ category: newCategory });
//   } catch (error) {
//     res.status(500).json({ message: "Error creating category", error: error.message });
//   }
// };
export const createCategory = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      startDate, 
      venue, 
      city, // New field
      details, 
      price, 
      registrationLimit 
    } = req.body;
    const image = req.file ? req.file.path : null;

    console.log("Backend - Received request body:", req.body);
    console.log("Backend - Received registrationLimit:", registrationLimit);

    // Authorization check
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!["organizer", "admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Only organizers or admins can create categories" });
    }

    // Validate required fields
    if (!title || !startDate || !venue || !city || !price) {
      return res.status(400).json({ message: "Title, start date, venue, city, and price are required" });
    }

    // Validate startDate (must be today or in the future)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const inputDate = new Date(startDate);
    if (inputDate < today) {
      return res.status(400).json({ message: "Start date cannot be in the past" });
    }

    // Custom fields parsing
    const customFields = req.body.customFields
      ? Array.isArray(req.body.customFields)
        ? req.body.customFields.map((field) => ({
            label: field.label?.trim() || "",
            value: field.value?.trim() || ""
          }))
        : JSON.parse(req.body.customFields || "[]").map((field) => ({
            label: field.label?.trim() || "",
            value: field.value?.trim() || ""
          }))
      : [];

    // Validate registrationLimit
    const regLimit = registrationLimit ? parseInt(registrationLimit) : null;
    if (regLimit && (isNaN(regLimit) || regLimit < 1)) {
      return res.status(400).json({ message: "Registration limit must be a positive number" });
    }

    // Create category with city
    const newCategory = new EventCategory({
      title,
      description,
      startDate,
      venue,
      city, // Add city to the new category
      details,
      price,
      image,
      organizer: req.user.name,
      email: req.user.email,
      customFields,
      registrationLimit: regLimit,
      registrations: []
    });

    await newCategory.save();
    console.log("Backend - Saved category:", newCategory.toObject());
    res.status(201).json({ category: newCategory });
  } catch (error) {
    console.error("Error creating category:", error.message);
    res.status(500).json({ message: "Error creating category", error: error.message });
  }
};




// ✅ Get All Categories (Including Image)
export const getCategories = async (req, res) => {
  try {
    const categories = await EventCategory.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories", error });
  }
};

// ✅ Get Categories for Organizer
export const getAllCategories = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }

    const categories = await EventCategory.find({ email : req.user.email });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories", error });
  }
};

// ✅ Update Category (Including Image)
// export const updateCategory = async (req, res) => {
//   try {
//     const { title, description, startDate, venue, details, price } = req.body;
//     const image = req.file ? req.file.path : undefined;

//     const updateData = { title, description, startDate, venue, details, price };
//     if (image) updateData.image = image; // Update image only if provided

//     const updatedCategory = await EventCategory.findByIdAndUpdate(req.params.id, updateData, { new: true });

//     if (!updatedCategory) return res.status(404).json({ message: "Category not found" });

//     res.status(200).json({ category: updatedCategory });
//   } catch (error) {
//     res.status(500).json({ message: "Error updating category" });
//   }
// };
export const updateCategory = async (req, res) => {
  try {
    const { title, description, startDate, venue, details, price, customFields, registrationLimit, city } = req.body;
    const image = req.file ? req.file.path : undefined;

    console.log("Backend - req.body:", req.body);
    console.log("Backend - City from req.body:", city);

    // Authorization check
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!["organizer", "admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Only organizers or admins can update categories" });
    }

    // Custom fields parsing
    const parsedCustomFields = customFields
      ? Array.isArray(customFields)
        ? customFields.map((field) => ({
            label: field.label?.trim() || "",
            value: field.value?.trim() || "",
          }))
        : JSON.parse(customFields || "[]").map((field) => ({
            label: field.label?.trim() || "",
            value: field.value?.trim() || "",
          }))
      : [];

    // Prepare update data
    const updateData = {
      title,
      description,
      startDate,
      venue,
      details,
      price,
      registrationLimit,
      city,
      customFields: parsedCustomFields,
    };

    if (image) updateData.image = image;

    console.log("Backend - updateData:", updateData);

    // Update category
    const updatedCategory = await EventCategory.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedCategory) return res.status(404).json({ message: "Category not found" });

    console.log("Backend - Updated category:", updatedCategory);

    res.status(200).json({ category: updatedCategory });
  } catch (error) {
    console.error("Error updating category:", error.message);
    res.status(500).json({ message: "Error updating category", error: error.message });
  }
};
// ✅ Delete Category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await EventCategory.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    // Admin can delete any category, others can delete only their own
    if (req.user.role !== "admin" && category.organizer !== req.user.name) {
      return res.status(403).json({ success: false, message: "Access denied. You can only delete your own categories." });
    }

    await category.deleteOne();
    res.status(200).json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting category", error: error.message });
  }
};



// EventCategoryController.js


export const getOrganizers = async (req, res) => {
  try {
    const organizers = await EventCategory.find({}, "title organizer venue city"); // Fetch only title and organizer

    res.status(200).json({ success: true, organizers });
  } catch (error) {
    console.error("Get Organizers Error:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
};
