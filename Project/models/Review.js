const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    movie: {
        type: Number,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    username: {
        type: String,
        required: true
    }, 
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 10
    },
    comment: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 1000,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date
    }, 
}, {timestamps: true});

// Prevent a user from reviewing the same movie twice
reviewSchema.index({ movie: 1, user: 1 }, { unique: true });
 
module.exports = mongoose.model('Review', reviewSchema);