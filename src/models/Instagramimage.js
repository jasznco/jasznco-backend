const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema(
  {
    image: [
      {
        image: {
          type: String,
          required: true
        }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('InstaImage', teamMemberSchema);
