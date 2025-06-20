const User = require("@models/User");
const response = require("../../responses");
const Newsletter = require("@models/NewsLetter");
const Review = require("@models/Review");

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

  giverate: async (req, res) => {
    console.log(req.body);
    try {
      let payload = req.body;
      const re = await Review.findOne({
        product: payload.product,
        posted_by: req.user.id,
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

      return response.ok(res, { message: "successfully" });
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

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const allreview = await Review.find(cond)
        .populate("product posted_by")
        .skip(skip)
        .limit(limit);

      const totalReviews = await Review.countDocuments(cond);

      res.status(200).json({
        success: true,
        data: allreview,
        page: page,
        totalReviews: totalReviews,
        totalPages: Math.ceil(totalReviews / limit), // Calculate total pages
      });
    } catch (e) {
      return res.status(500).json({
        success: false,
        message: e.message,
      });
    }
  },

  fileUpload: async (req, res) => {
    try {
      if (!req.file) {
        return response.badRequest(res, { message: "No file uploaded." });
      }
      console.log(req.file);
      return response.ok(res, {
        message: "File uploaded successfully.",
        fileUrl: req.file.path, // Cloudinary file URL
        fileName: req.file.filename, // public ID
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
        data: users,
        // pagination,
      });
    } catch (error) {
      return response.error(res, error);
    }
  },
};
