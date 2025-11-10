'use strict';
const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema(
  {
    user: {
      type: String
    },
    expiration_at: {
      type: Date
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: String,
    password: String,
    otp: {
      type: String
    },
    verified: {
      type: Boolean,
      default: false
    },
    phone: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

verificationSchema.set('toJSON', {
  getters: true,
  virtuals: false,
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Verification', verificationSchema);
