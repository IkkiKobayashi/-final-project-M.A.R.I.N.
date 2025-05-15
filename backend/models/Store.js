const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Store name is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Store location is required']
  },
  code: {
    type: String,
    default: () => `STR${Date.now()}`
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  contact: {
    manager: {
      type: String,
      required: [true, 'Manager name is required']
    }
  },
  image: String,
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Store', storeSchema);
