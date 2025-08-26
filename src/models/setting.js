'use strict';

const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    carousel: [
      {
        image: {
          type: String
        },
        Category: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Category'
        }
      }
    ],
    Address: {
      type: String
    },
    MobileNo: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

settingSchema.set('toJSON', {
  getters: true,
  virtuals: false,
  transform: (doc, ret, options) => {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Setting', settingSchema);
