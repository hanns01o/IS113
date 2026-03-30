// models/SearchHistory.js
const mongoose = require('mongoose');

const searchHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  query: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

searchHistorySchema.index({ userId: 1, query: 1 }, { unique: true });

searchHistorySchema.statics.createEntry = async function (userId, query) {
  return await this.create({ userId, query });
};

searchHistorySchema.statics.getHistory = async function (userId) {
  return await this.find({ userId }).sort({ updatedAt: -1 }).limit(5);
};

searchHistorySchema.statics.updateEntry = async function (userId, query) {
  return await this.findOneAndUpdate(
    { userId, query },
    { $set: { updatedAt: new Date() } },
    { upsert: true, returnDocument: 'after' }
  );
};

searchHistorySchema.statics.deleteEntry = async function (id, userId) {
  return await this.findOneAndDelete({ _id: id, userId });
};

module.exports = mongoose.model('SearchHistory', searchHistorySchema);