const Wholesale = require('@models/wholesale');
const response = require('../../responses');
const mailNotification = require('./../services/mailNotification');

module.exports = {
  addWholesale: async (req, res) => {
    try {
      const { email } = req.body;

      const existingWholesale = await Wholesale.findOne({ email });

      if (existingWholesale) {
        return response.error(res, { message: "A request with this email already exists. Please wait until it is fulfilled" });
      }

      const newWholesale = new Wholesale(req.body);
      await newWholesale.save();

      await mailNotification.wholesaleApplicationReceived({
        WholesaleData: req.body,
        email
      });

      await mailNotification.wholesaleApplicationAdmin({
        WholesaleData: req.body
      });

      return response.ok(res, {
        status: true,
        message: "Wholesale request submitted successfully"
      });

    } catch (error) {
      return response.error(res, error);
    }
  },


  getAllWholesale: async (req, res) => {
    try {
      let cond = {};

      if (req.body.curDate) {
        const startDate = new Date(req.body.curDate);
        const endDate = new Date(
          new Date(req.body.curDate).setDate(startDate.getDate() + 1)
        );
        cond.createdAt = { $gte: startDate, $lte: endDate };
      }

      if (req.body.name) {
        const name = req.body.name.substring(0, 3);
        cond.name = { $regex: '^' + name, $options: 'i' };
      }
      if (req.body.companyName) {
        const name = req.body.companyName.substring(0, 3);
        cond.companyName = { $regex: '^' + name, $options: 'i' };
      }

      if (req.body.email) {
        cond.email = { $regex: req.body.email, $options: 'i' };
      }

      let page = parseInt(req.query.page);
      let limit = parseInt(req.query.limit);
      let skip = (page - 1) * limit;

      const totalItems = await Wholesale.countDocuments(cond);
      const totalPages = Math.ceil(totalItems / limit);

      const records = await Wholesale.find(cond)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return res.status(200).json({
        status: true,
        data: records,
        pagination: {
          totalItems,
          totalPages,
          currentPage: page,
          itemsPerPage: limit
        }
      });
    } catch (error) {
      return response.error(res, error);
    }
  },

  updateStatusForWholesale: async (req, res) => {
    try {
      const { id, status } = req.body;
      console.log(id, status);
      if (!id || !status) {
        return res
          .status(400)
          .json({ status: false, message: 'ID and status are required.' });
      }

      const validStatuses = ['pending', 'underReview', 'approved', 'rejected'];
      if (!validStatuses.includes(status)) {
        return res
          .status(400)
          .json({ status: false, message: 'Invalid status value.' });
      }

      const updatedWholesale = await Wholesale.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );

      if (!updatedWholesale) {
        return res
          .status(404)
          .json({ status: false, message: 'Wholesale request not found.' });
      }

      return res.status(200).json({
        status: true,
        message: 'Status updated successfully',
        data: updatedWholesale
      });
    } catch (error) {
      console.error('Update Status Error:', error);
      return res
        .status(500)
        .json({ status: false, message: 'Server error', error: error.message });
    }
  }
};
