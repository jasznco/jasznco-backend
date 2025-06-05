const Contact = require('@models/contactUs');
const response = require("../../responses");

module.exports = {
    contactUs: async (req, res) => {
        try {
            const { name, Email, subject, message } = req.body;
            // Create a new contact entry
            const newContact = new Contact({ name, Email, subject, message });
            await newContact.save();
            return response.ok(res, { message: 'Contact submitted successfully' });
        } catch (error) {
            return response.error(res, error);
        }
    },

    getContactUs: async (req, res) => {
        try {
            const contact = await Contact.find();
            return response.ok(res, contact)
        } catch (error) {
            return response.error(res, error)
        }
    },
}