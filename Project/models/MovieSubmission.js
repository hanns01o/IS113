const mongoose = require('mongoose');

const movieSubmissionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    genre: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    posterUrl: {
        type: String,
        default: "images/default-poster.jpg"
    },
    bannerUrl: {
        type: String,
        default: "images/default-banner.jpg"
    },
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    submissionDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.models.MovieSubmission || mongoose.model('MovieSubmission', movieSubmissionSchema);