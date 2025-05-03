const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    region: {
        type: String,
        required: true
    },
    budget: {
        type: Number,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    firm: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Firm',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Package', packageSchema); 