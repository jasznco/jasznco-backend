const mongoose = require('mongoose');
const { unique } = require('underscore');

const wholesaleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    companyName: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    EIN: {
      type: String,
      required: true,
      trim: true
    },
    stateTaxLicense: {
      type: String,
      required: true,
      trim: true
    },
    phoneNumber: {
      type: String,
      required: true,
      match: [/^\+?[0-9]{7,15}$/, 'Please fill a valid phone number']
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+@.+\..+/, 'Please fill a valid email address']
    },
    itemsOfInterest: {
      type: [String],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'underReview', 'approved', 'rejected'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

const Wholesale = mongoose.model('Wholesale', wholesaleSchema);

module.exports = Wholesale;
