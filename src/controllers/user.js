const User = require('@models/User');
const response = require('../../responses');
const Newsletter = require('@models/NewsLetter');
const Review = require('@models/Review');
const crypto = require('crypto');
const mailNotification = require('../services/mailNotification');

module.exports = {
  addNewsLetter: async (req, res) => {
    try {
      const email = req?.body?.email?.toLowerCase()?.trim();
      if (!email) return response.badRequest(res, { message: 'Email is required.' });

      const existing = await Newsletter.findOne({ email });

      if (existing) {
        if (existing.verified) {
          return response.conflict(res, { message: 'This email is already subscribed.' });
        } else {
          // Already sent but not verified — don't send again
          return response.conflict(res, { message: 'A confirmation link has already been sent to this email. Please check your inbox.' });
        }
      }

      // Generate a secure token
      const token = crypto.randomBytes(32).toString('hex');

      const news = new Newsletter({ email, token, verified: false });
      await news.save();

      const confirmUrl = `${process.env.FRONTEND_URL}/confirm-newsletter?token=${token}`;
      await mailNotification.newsletterConfirmation({ email, confirmUrl });

      return response.ok(res, { message: 'A confirmation link has been sent to your email. Please click it to complete your subscription.' });
    } catch (error) {
      return response.error(res, error);
    }
  },

  verifyNewsLetter: async (req, res) => {
    try {
      const { token } = req.query;
      if (!token) return response.badRequest(res, { message: 'Invalid or missing token.' });

      const subscriber = await Newsletter.findOne({ token });

      if (!subscriber) {
        return response.notFound(res, { message: 'Invalid or expired confirmation link.' });
      }

      if (subscriber.verified) {
        return response.ok(res, { message: 'You are already subscribed!' });
      }

      subscriber.verified = true;
      subscriber.token = null;
      await subscriber.save();

      return response.ok(res, { message: 'You have successfully subscribed to our newsletter!' });
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
      return response.ok(res, { message: 'Deleted successfully' });
    } catch (error) {
      return response.error(res, error);
    }
  },

  giverate: async (req, res) => {
    console.log(req.body);
    try {
      let payload = req.body;
      const re = await Review.findOne({
        product: payload.product,
        posted_by: req.user.id
      });
      console.log(re);
      if (re) {
        re.description = payload.description;
        re.rating = payload.rating;
        await re.save();
      } else {
        payload.posted_by = req.user.id;
        const u = new Review(payload);
        await u.save();
      }

      return response.ok(res, { message: 'successfully' });
    } catch (error) {
      return response.error(res, error);
    }
  },

  getReview: async (req, res) => {
    try {
      const cond = {};
      if (req.params.id) {
        cond.user = req.params.id;
      }

      if (req.body.selectedDate) {
        const date = new Date(req.body.selectedDate);
        const nextDay = new Date(date);
        nextDay.setDate(date.getDate() + 1);

        cond.createdAt = {
          $gte: date,
          $lt: nextDay
        };
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const allreview = await Review.find(cond)
        .populate('product posted_by')
        .skip(skip)
        .sort({ createdAt: -1 })
        .limit(limit);

      const totalReviews = await Review.countDocuments(cond);

      // Response
      res.status(200).json({
        success: true,
        data: allreview,
        page,
        totalReviews,
        totalPages: Math.ceil(totalReviews / limit)
      });
    } catch (e) {
      res.status(500).json({
        success: false,
        message: e.message
      });
    }
  },

  deleteReview: async (req, res) => {
    try {
      const ID = req.params.id;
      console.log(ID);
      const Re = await Review.findByIdAndDelete(ID);
      console.log(Re);

      if (!Re) {
        return response.notFound(res, { message: 'Not Found' });
      }

      return response.ok(res, { message: 'Review deleted successfully' });
    } catch (error) {
      console.log(error);
      return response.error(res, error);
    }
  },
  fileUpload: async (req, res) => {
    try {
      if (!req.file) {
        return response.badRequest(res, { message: 'No file uploaded.' });
      }
      console.log(req.file);
      return response.ok(res, {
        message: 'File uploaded successfully.',
        fileUrl: req.file.path, // Cloudinary file URL
        fileName: req.file.filename // public ID
      });
    } catch (error) {
      return response.error(res, error);
    }
  },
  getUserList: async (req, res) => {
    try {
      const cond = { role: req.body.type };

      // // Check if page & limit are provided
      // const page = parseInt(req.query.page);
      // const limit = parseInt(req.query.limit);

      let users;
      // let totalItems;
      // let pagination = null;

      // if (!page || !limit) {
      //   // No pagination — return all data
      //   users = await User.find(cond).sort({ createdAt: -1 });
      //   totalItems = users.length;
      // } else {
      //   // Paginate
      //   const skip = (page - 1) * limit;
      //   totalItems = await User.countDocuments(cond);
      //   const totalPages = Math.ceil(totalItems / limit);

      //   users = await User.find(cond)
      //     .sort({ createdAt: -1 })
      //     .skip(skip)
      //     .limit(limit);

      //   pagination = {
      //     totalItems,
      //     totalPages,
      //     currentPage: page,
      //     itemsPerPage: limit,
      //   };
      // }

      users = await User.find(cond).sort({ createdAt: -1 });

      return res.status(200).json({
        status: true,
        data: users
        // pagination,
      });
    } catch (error) {
      return response.error(res, error);
    }
  }
};
