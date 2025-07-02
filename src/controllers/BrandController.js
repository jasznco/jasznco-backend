"use strict";

const Brand = require("@models/Brand");
const mongoose = require("mongoose");
const response = require("../../responses");

module.exports = {
  createBrand: async (req, res) => {
    try {
      const { name ,image} = req.body;
      if (!name) {
        return res.status(400).json({ message: "Name is required" });
      }

      const slug = name
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "");

      const Brands = new Brand({ name, slug ,image });
      const savedBrand = await Brands.save();

      return response.ok(res, savedBrand, {
        message: "Brand added successfully",
      });
    } catch (error) {
      return response.error(res, error);
    }
  },

  getBrands: async (req, res) => {
    try {
      const Brands = await Brand.find({});
      return response.ok(res, Brands);
    } catch (error) {
      return response.error(res, error);
    }
  },

  deleteBrand: async (req, res) => {
    try {
      const { id } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid Brand ID" });
      }

      const deletedBrand = await Brand.findByIdAndDelete(id);
      if (!deletedBrand) {
        return res.status(404).json({ message: "Brand not found" });
      }

      return response.ok(res, null, { message: "Brand deleted successfully" });
    } catch (error) {
      return response.error(res, error);
    }
  },

  updateBrand: async (req, res) => {
    try {
      const { name, _id ,image } = req.body;

      if (!name) {
        return res.status(400).json({ message: "Name is required" });
      }

      const slug = name
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "");

      const updatedBrand = await Brand.findByIdAndUpdate(
        _id,
        { name, slug ,image},
        { new: true }
      );

      if (!updatedBrand) {
        return res.status(404).json({ message: "Brand not found" });
      }

      return response.ok(res, updatedBrand, {
        message: "Brand updated successfully",
      });
    } catch (error) {
      return response.error(res, error);
    }
  },
};
