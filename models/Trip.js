const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    package: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Package',
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['upcoming', 'completed'],
        default: 'upcoming'
    }
}, { timestamps: true });

module.exports = mongoose.model('Trip', tripSchema); 