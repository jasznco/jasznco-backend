"use strict";

const mongoose = require("mongoose");
const { object } = require("underscore");

const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Point"],
  },
  coordinates: {
    type: [Number],
  },
});

const productrequestchema = new mongoose.Schema(
  {
    productDetail: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        image: [
          {
            type: String,
          },
        ],
        total: {
          type: Number,
        },
        color: {
          type: String,
        },
        size: {
          type: String,
        },
        attribute: {
          type: object,
        },
        qty: {
          type: Number,
        },
        price: {
          type: Number,
        },
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    easyship_shipment_id: {
      type: String,
      unique: true,
    },
    courier_id: {
      type: String,
    },
    tracking_number: { type: String },
    label_url: { type: String },
    status: {
      type: String,
      enum: [
        "Pending",
        "Processing",
        "WAITING_FOR_PICKUP",
        "IN_TRANSIT",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "CANCELLED",
        "LABEL_FAILED",
      ],
      default: "Pending",
    },

    orderId: {
      type: String,
      unique: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    seller_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    total: {
      type: String,
    },
    subtotal: {
      type: Number,
    },
    shippingCost: {
      type: Number,
    },
    ShippingAddress: {
      type: Object,
    },
    location: {
      type: pointSchema,
    },
    PaymentStatus: {
      type: String,
      enum: ["Paid", "UnPaid", "Pending"],
      default: "Pending",
    },
    trackingPageUrl: { type: String },
    lastTrackingStatus: { type: String },
    easyshipTrackingStatus: { type: String },
    failureReason: { type: String },

    checkpoints: [
      {
        location: String,
        message: String,
        status: String,
        trackedAt: Date,
      },
    ],
  },
  {
    timestamps: true,
  },
);

productrequestchema.set("toJSON", {
  getters: true,
  virtuals: false,
  transform: (doc, ret, options) => {
    delete ret.__v;
    return ret;
  },
});
productrequestchema.index({ location: "2dsphere" });

module.exports = mongoose.model("ProductRequest", productrequestchema);
