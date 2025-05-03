const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'vendor',
        enum: ['vendor', 'admin']
    },
    firm: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Firm'
    }
}, { timestamps: true });

module.exports = mongoose.model('Vendor', vendorSchema); 