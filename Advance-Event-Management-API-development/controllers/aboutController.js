import About from '../models/aboutModel.js';

// Get About Data
export const getAbout = async (req, res) => {
  try {
    const about = await About.findOne(); // Assuming single "About" entry
    if (!about) {
      return res.status(404).json({ success: false, message: 'About content not found' });
    }
    res.status(200).json(about);
  } catch (error) {
    console.error('Error fetching about:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update or Create About Data
export const updateAbout = async (req, res) => {
  const { title, intro, whyChooseUs, mission } = req.body;

  if (!title || !intro || !mission) {
    return res.status(400).json({ success: false, message: 'Title, intro, and mission are required' });
  }

  try {
    const updatedData = {
      title,
      intro,
      whyChooseUs: whyChooseUs || [],
      mission,
      updatedAt: Date.now()
    };

    const about = await About.findOneAndUpdate({}, updatedData, {
      new: true,
      upsert: true, // Create if not exists
      setDefaultsOnInsert: true
    });

    res.status(200).json({ success: true, message: 'About content updated successfully', data: about });
  } catch (error) {
    console.error('Error updating about:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};