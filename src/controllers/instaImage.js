const InstaImage = require('@models/Instagramimage'); // Adjust path as needed
const response = require('../../responses');

module.exports = {
  getInstaImage: async (req, res) => {
    try {
      const instaImage = await InstaImage.find({});
      res.status(200).json({
        success: true,
        message: 'Fetched all carosal successfully',
        InstaImage: instaImage
      });
    } catch (e) {
      return res.status(500).json({
        success: false,
        message: e.message
      });
    }
  },

  createOrUpdateInstaImage: async (req, res) => {
    try {
      const payload = req.body;
      let instaImage = await InstaImage.findOneAndUpdate({}, payload, {
        new: true,
        upsert: true
      });

      return res.status(201).json({
        success: true,
        message: 'Data saved/updated successfully!',
        data: instaImage
      });
    } catch (e) {
      return res.status(500).json({
        success: false,
        message: e.message
      });
    }
  }
};
