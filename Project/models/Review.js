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
        required: [true, 'Rating is required'],
        min: 1,
        max: 10
    },
    comment: {
        type: String,
        required: [true, 'Comment cannot be empty'],
        minlength: [10, 'Comment must be at least 10 characters'],
        maxlength: [1000, 'Comment is too long'],
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