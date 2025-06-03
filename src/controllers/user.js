const User = require('@models/User');
const response = require("../../responses");
const Newsletter = require('@models/NewsLetter');

module.exports = {
    addNewsLetter: async (req, res) => {
        try {
            const payload = req?.body || {};
            const u = await Newsletter.find(payload);
            if (u.length > 0) {
                return response.conflict(res, {
                    message: "Email already exists.",
                });
            } else {
                let news = new Newsletter(payload);
                const newsl = await news.save();
                return response.ok(res, { message: "Subscribed successfully" });
            }
        } catch (error) {
            return response.error(res, error);
        }
    },

    getNewsLetter: async (req, res) => {
        try {
            let news = await Newsletter.find();
            return response.ok(res, news);
        } catch (error) {
            return response.error(res, error);
        }
    },

    DeleteNewsLetter: async (req, res) => {
        try {
            let news = await Newsletter.findByIdAndDelete(req.body.id);
            return response.ok(res, { message: "Deleted successfully" });
        } catch (error) {
            return response.error(res, error);
        }
    },
}
