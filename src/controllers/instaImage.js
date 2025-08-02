
const InstaImage = require("@models/Instagramimage") // Adjust path as needed
const response = require("../../responses");

module.exports = {
    createInstaImage: async (req, res) => {
        try {

            const notify = new InstaImage(req.body)
            const noti = await notify.save();
            return res.status(201).json({
                success: true,
                message: 'Data Saved successfully!',
                data: noti
            })
        } catch (e) {
            return res.status(500).json({
                success: false,
                message: e.message
            });
        }
    },

    getInstaImage: async (req, res) => {
        try {
            const instaImage = await InstaImage.find({});
            res.status(200).json({
                success: true,
                message: 'Fetched all carosal successfully',
                InstaImage: instaImage
            })

        } catch (e) {
            return res.status(500).json({
                success: false,
                message: e.message
            });
        }
    },

    updateInstaImage: async (req, res) => {
        try {
            const payload = req?.body || {};
            let instaImage = await InstaImage.findByIdAndUpdate(payload?.id, payload, {
                new: true,
                upsert: true,
            });
            return res.status(200).json({
                success: true,
                message: 'Updated successfully',
                InstaImage: instaImage
            })
        } catch (error) {
            return response.error(res, error);
        }
    }


};
