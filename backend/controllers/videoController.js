import Video from '../models/Video.js';

// Get videos by stage
export const getVideosByStage = async (req, res) => {
  try {
    const { stageId } = req.params;
    const videos = await Video.getByStage(stageId);

    res.json({ videos });
  } catch (error) {
    console.error('Get videos error:', error);
    res.status(500).json({ message: 'Error fetching videos', error: error.message });
  }
};

// Get all videos (Instructor/Admin only)
export const getAllVideos = async (req, res) => {
  try {
    const videos = await Video.getAll();

    res.json({ videos });
  } catch (error) {
    console.error('Get all videos error:', error);
    res.status(500).json({ message: 'Error fetching videos', error: error.message });
  }
};

// Create video (Instructor/Admin only)
export const createVideo = async (req, res) => {
  try {
    const { stageId, title, url, description, orderNumber } = req.body;

    if (!stageId || !title || !url) {
      return res.status(400).json({ message: 'Please provide stageId, title, and url' });
    }

    const video = await Video.create(stageId, title, url, description, orderNumber);

    res.status(201).json({ message: 'Video created successfully', video });
  } catch (error) {
    console.error('Create video error:', error);
    res.status(500).json({ message: 'Error creating video', error: error.message });
  }
};

// Update video (Instructor/Admin only)
export const updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    await Video.update(id, updates);

    res.json({ message: 'Video updated successfully' });
  } catch (error) {
    console.error('Update video error:', error);
    res.status(500).json({ message: 'Error updating video', error: error.message });
  }
};

// Delete video (Instructor/Admin only)
export const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;

    await Video.delete(id);

    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({ message: 'Error deleting video', error: error.message });
  }
};

export default {
  getVideosByStage,
  getAllVideos,
  createVideo,
  updateVideo,
  deleteVideo
};
