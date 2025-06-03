const contactUs = require('@models/contactUs');
const response = require("../../responses");

module.exports = {
    contactUs: async (req, res) => {
        try {
            const { name, email, description } = req.body;

            if (!name || !email || !description) {
                return res.status(400).json({ message: 'Name and email and description are required' });
            }

            const payload = req?.body || {};
            let cont = new contactUs(payload);
            await cont.save();

            return response.ok(res, { message: 'Your message has been sent successfully!' });
        } catch (error) {
            return response.error(res, error);
        }
    },

    getContactUs: async (req, res) => {
        try {
            const contact = await contactUs.find();
            return response.ok(res, contact)
        } catch (error) {
            return response.error(res, error)
        }
    },
}