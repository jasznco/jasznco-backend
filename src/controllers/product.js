const mongoose = require("mongoose");
const Product = require("@models/product");
const ProductRequest = require("@models/product-request");
const User = mongoose.model("User");
// const { parseStringPromise } = require('xml2js');
const { DateTime } = require("luxon"); // still can be kept if needed elsewhere
const Category = mongoose.model("Category");
const response = require("./../../responses");
// const mailNotification = require("../services/mailNotification");

module.exports = {
  createProduct: async (req, res) => {
    try {
      const payload = req?.body || {};

      const existingProduct = await Product.findOne({
        name: payload.name,
        categoryName: payload.categoryName,
        subCategoryName: payload.subCategoryName,
      });

      if (existingProduct) {
        return res.status(400).json({
          status: false,
          message:
            "Product with the same name in this category/subcategory already exists",
        });
      }

      // If no duplicate, create new product
      const newProduct = new Product(payload);
      await newProduct.save();

      return response.ok(res, { message: "Product added successfully" });
    } catch (error) {
      return response.error(res, error);
    }
  },

  getProductFromLocalApi: async (req, res) => {
    try {
      const headers = {
        Accept: "application/xml",
      };
      if (req.body.token) {
        headers.Authorization = req.body.token;
      }
      const response = await fetch(req.body.url, {
        method: "get",
        mode: "cors",
        headers: {
          "Accept-language": "pl\r\n",
          Accept: "application/xml",
          Authorization: "Token 38f6d786d20352799f07c00310fc94679d5479ea\r\n",
        },
      });

      if (!response.ok) {
        // Handle non-200 responses
        return res
          .status(response.status)
          .json({ error: `Error fetching data: ${response.statusText}` });
      }

      const xmlData = await response.text();
      const jsonData = await parseStringPromise(xmlData);

      // Send the parsed JSON data
      return res.status(200).json({
        success: true,
        data: jsonData,
      });
    } catch (error) {
      // Catch and handle any errors
      console.error("Error:", error);
      return res.status(500).json({
        success: false,
        error: "Internal Server Error",
      });
    }
  },

  createManyProduct: async (req, res) => {
    try {
      const payload = req?.body || {};
      let cat = await Product.insertMany(payload);
      // await cat.save();
      return response.ok(res, { message: "Product added successfully" });
    } catch (error) {
      return response.error(res, error);
    }
  },

  getProduct: async (req, res) => {
    try {
      let product = await Product.find()
        .populate("category")
        .sort({ createdAt: -1 });
      return response.ok(res, product);
    } catch (error) {
      return response.error(res, error);
    }
  },

  getProductById: async (req, res) => {
    try {
      let product = await Product.findById(req?.params?.id).populate(
        "category"
      );
      return response.ok(res, product);
    } catch (error) {
      return response.error(res, error);
    }
  },

  getProductBycategoryId: async (req, res) => {
    console.log(req.query);
    try {
      let cond = {};
      if (req?.query?.category) {
        cond.category = { $in: [req?.query?.category] };
      }
      if (req?.query?.product) {
        cond._id = { $ne: req?.query?.product };
      }
      let sort_by = {};
      if (req.query.is_top) {
        cond.is_top = true;
      }
      if (req.query.is_new) {
        cond.is_new = true;
      }

      if (req.query.colors && req.query.colors.length > 0) {
        cond.varients = {
          $ne: [],
          $elemMatch: { color: { $in: req.query.colors } },
        };
      }

      if (req.query.brand) {
        cond.brand = req.query.brand;
      }

      if (req.query.gender) {
        let c = {};
        if (req.query.gender === "Male") {
          cond.$or = [{ gender: req.query.gender }, { gender: "Men's" }];
        }
        if (req.query.gender === "Female") {
          cond.$or = [
            { gender: req.query.gender },
            { gender: "Ladies" },
            { gender: "Ladies'" },
          ];
        }
        if (req.query.gender === "Unisex") {
          cond.$or = [{ gender: req.query.gender }, { gender: "" }];
        }
      }

      if (req.query.sort_by) {
        if (req.query.sort_by === "featured" || req.query.sort_by === "new") {
          sort_by.createdAt = -1;
        }

        if (req.query.sort_by === "old") {
          sort_by.createdAt = 1;
        }

        if (req.query.sort_by === "a_z") {
          sort_by.name = 1;
        }

        if (req.query.sort_by === "z_a") {
          sort_by.name = -1;
        }

        if (req.query.sort_by === "low") {
          sort_by.price = 1;
        }

        if (req.query.sort_by === "high") {
          sort_by.price = -1;
        }
      } else {
        sort_by.createdAt = -1;
      }
      let skip = (req.query.page - 1) * req.query.limit;
      let product = await Product.find(cond)
        .populate("category brand")
        .sort(sort_by)
        .skip(skip)
        .limit(req.query.limit);
      let d = await Product.countDocuments(cond);
      console.log(d);
      return response.ok(res, { product, length: d });
    } catch (error) {
      return response.error(res, error);
    }
  },

  getProductBythemeId: async (req, res) => {
    console.log(req.query);
    try {
      let cond = {
        theme: { $in: [req?.params?.id] },
      };
      let sort_by = {};
      if (req.query.is_top) {
        cond.is_top = true;
      }
      if (req.query.is_new) {
        cond.is_new = true;
      }

      if (req.query.brand) {
        cond.brand = req.query.brand;
      }

      if (req.query.gender) {
        cond.gender = req.query.gender;
      }

      if (req.query.colors && req.query.colors.length > 0) {
        cond.varients = {
          $ne: [],
          $elemMatch: { color: { $in: req.query.colors } },
        };
      }

      if (req.query.sort_by) {
        if (req.query.sort_by === "featured" || req.query.sort_by === "new") {
          sort_by.createdAt = -1;
        }

        if (req.query.sort_by === "old") {
          sort_by.createdAt = 1;
        }

        if (req.query.sort_by === "a_z") {
          sort_by.name = 1;
        }

        if (req.query.sort_by === "z_a") {
          sort_by.name = -1;
        }

        if (req.query.sort_by === "low") {
          sort_by.price = 1;
        }

        if (req.query.sort_by === "high") {
          sort_by.price = -1;
        }
      } else {
        sort_by.createdAt = -1;
      }
      let product;
      let d;
      // const product = await Product.find(cond).populate('theme brand').sort(sort_by);
      if (req.query.page) {
        let skip = (req.query.page - 1) * req.query.limit;
        product = await Product.find(cond)
          .populate("theme brand")
          .sort(sort_by)
          .skip(skip)
          .limit(req.query.limit);
        d = await Product.countDocuments(cond);
      } else {
        product = await Product.find(cond)
          .populate("theme brand")
          .sort(sort_by)
          .limit(8);
      }

      return response.ok(res, { product, length: d });
    } catch (error) {
      return response.error(res, error);
    }
  },
  getColors: async (req, res) => {
    try {
      let product = await Product.aggregate([
        { $unwind: "$varients" },
        {
          $group: {
            _id: null, // We don't need to group by a specific field, so use null
            uniqueColors: { $addToSet: "$varients.color" }, // $addToSet ensures uniqueness
          },
        },
        {
          $project: {
            _id: 0, // Exclude _id from the output
            uniqueColors: 1,
          },
        },
      ]);

      return response.ok(res, product[0]);
    } catch (error) {
      return response.error(res, error);
    }
  },

  updateProduct: async (req, res) => {
    try {
      const payload = req?.body || {};
      let product = await Product.findByIdAndUpdate(payload?.id, payload, {
        new: true,
        upsert: true,
      });
      return response.ok(res, product);
    } catch (error) {
      return response.error(res, error);
    }
  },

  productSearch: async (req, res) => {
    try {
      let cond = {
        $or: [
          { name: { $regex: req.query.key, $options: "i" } },
          // { categoryName: { $in: [{ $regex: req.query.key, $options: "i" }] } },
          // { themeName: { $in: [{ $regex: req.query.key, $options: "i" }] } },
          { brandName: { $regex: req.query.key, $options: "i" } },
          // { details: { $regex: q.location, $options: "i" } },
        ],
      };
      const product = await Product.find(cond).sort({ createdAt: -1 });
      return response.ok(res, product);
    } catch (error) {
      return response.error(res, error);
    }
  },

  topselling: async (req, res) => {
    try {
      let product = await Product.find({ is_top: true }).sort({
        updatedAt: -1,
      });
      return response.ok(res, product);
    } catch (error) {
      return response.error(res, error);
    }
  },

  getnewitem: async (req, res) => {
    try {
      let product = await Product.find({ is_new: true }).sort({
        updatedAt: -1,
      });
      return response.ok(res, product);
    } catch (error) {
      return response.error(res, error);
    }
  },

  deleteProduct: async (req, res) => {
    try {
      await Product.findByIdAndDelete(req?.params?.id);
      return response.ok(res, { meaasge: "Deleted successfully" });
    } catch (error) {
      return response.error(res, error);
    }
  },

  deleteAllProduct: async (req, res) => {
    try {
      const newid = req.body.products.map(
        (f) => new mongoose.Types.ObjectId(f)
      );
      await Product.deleteMany({ _id: { $in: newid } });
      return response.ok(res, { meaasge: "Deleted successfully" });
    } catch (error) {
      return response.error(res, error);
    }
  },

  requestProduct: async (req, res) => {
    try {
      const payload = req?.body || {};
      const storePrefix = "JASZ";

      const lastOrder = await ProductRequest.findOne()
        .sort({ createdAt: -1 })
        .lean();

      let orderNumber = 1;

      const centralTime = DateTime.now().setZone("America/Chicago");
      const datePart = centralTime.toFormat("yyLLdd"); // e.g., 240612

      if (lastOrder && lastOrder.orderId) {
        const match = lastOrder.orderId.match(/-(\d{2})$/);
        if (match && match[1]) {
          orderNumber = parseInt(match[1], 10) + 1;
        }
      }

      const orderPart = String(orderNumber).padStart(2, "0");
      const generatedOrderId = `${storePrefix}-${datePart}-${orderPart}`;

      payload.orderId = generatedOrderId;

      const newOrder = new ProductRequest(payload);
      newOrder.orderId = generatedOrderId;

      await newOrder.save();

      await Promise.all(
        payload.productDetail.map(async (productItem) => {
          const product = await Product.findById(productItem.product);
          if (!product) return;

          const colorToMatch = productItem.color;
          const selectedSize = productItem.selected?.[0]?.value;
          const quantityToReduce = Number(productItem.total || 0);

          if (!colorToMatch || !selectedSize || !quantityToReduce) return;

          const updatedVariants = product.variants.map((variant) => {
            if (variant.color !== colorToMatch) return variant;

            const updatedSelected = variant.selected.map((sel) => {
              if (sel.value === selectedSize) {
                return {
                  ...sel,
                  total: Math.max(
                    Number(sel.total) - quantityToReduce,
                    0
                  ).toString(),
                };
              }
              return sel;
            });

            return {
              ...variant,
              selected: updatedSelected,
            };
          });

          await Product.findByIdAndUpdate(
            product._id,
            {
              variants: updatedVariants,
              $inc: {
                sold_pieces: quantityToReduce,
                Quantity: -quantityToReduce,
              },
            },
            { new: true }
          );
        })
      );

      return response.ok(res, {
        message: "Product request added successfully",
        orders: newOrder,
      });
    } catch (error) {
      return response.error(res, error);
    }
  },

  getrequestProduct: async (req, res) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      console.log(req.user?.id);
      console.log(req.user?._id);
      const product = await ProductRequest.find({ user: req.user?.id })
        .populate("productDetail.product user", "-password -varients")
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

      return response.ok(res, product);
    } catch (error) {
      return response.error(res, error);
    }
  },

  getHistoryProduct: async (req, res) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const product = await ProductRequest.find({
        user: req.user?.id,
        status: "Completed",
      })
        .populate("productDetail.product user", "-password -varients")
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 });

      return response.ok(res, product);
    } catch (error) {
      return response.error(res, error);
    }
  },

//   getrequestProductbyid: async (req, res) => {
//     try {
//       console.log("Request ID:", req.params.id);

//       const product = await ProductRequest.findById(req.params.id)
//         .populate("user", "-password")
//         .populate("productDetail.product"); 

//       return response.ok(res, product);
//     } catch (error) {
//       console.error("Error in getrequestProductbyid:", error);
//       return response.error(res, error);
//     }
//   },

  updaterequestProduct: async (req, res) => {
    try {
      const product = await ProductRequest.findByIdAndUpdate(
        req.params.id,
        req.body,
        { upsert: true, new: true }
      );
      return response.ok(res, product);
    } catch (error) {
      return response.error(res, error);
    }
  },

    getOrderBySeller: async (req, res) => {
        try {
            const cond = {};

            if (req.body.curentDate) {
                const date = new Date(req.body.curentDate);
                const nextDay = new Date(date);
                nextDay.setDate(date.getDate() + 1);
                cond.createdAt = { $gte: date, $lte: nextDay };
            }

            if (req.body.orderId) {
                const orderId = req.body.orderId.trim();
                if (orderId.length > 0) {
                    cond.orderId = { $regex: orderId, $options: 'i' };
                }
            }

            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            const products = await ProductRequest.find(cond)
                .populate("user", "-password -varients")
                .populate("productDetail.product")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            const totalItems = await ProductRequest.countDocuments(cond);

            return res.status(200).json({
                status: true,
                data: products.map((item, index) => ({
                    ...(item.toObject?.() || item),
                    indexNo: skip + index + 1,
                })),
                pagination: {
                    totalItems,
                    totalPages: Math.ceil(totalItems / limit),
                    currentPage: page,
                    itemsPerPage: limit,
                },
            });
        } catch (error) {
            console.error("Error in getOrderBySeller:", error);
            return res.status(500).json({
                status: false,
                message: error.message || "An error occurred"
            });
        }
    },


  getrequestProductbyid: async (req, res) => {
    try {
      const product = await ProductRequest.findById(req.params.id)
        .populate("user", "-password")
        .populate("category")
        .populate("productDetail.product");
      return response.ok(res, product);
    } catch (error) {
      return response.error(res, error);
    }
  },

  getrequestProductbyuser: async (req, res) => {
    try {
      const product = await ProductRequest.find({ user: req.user.id })
        .populate("category product")
        .sort({ createdAt: -1 });
      return response.ok(res, product);
    } catch (error) {
      return response.error(res, error);
    }
  },
};
