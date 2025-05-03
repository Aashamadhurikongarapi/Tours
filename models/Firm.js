const mongoose = require('mongoose');

const firmSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    },
    packages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Package'
    }]
}, { timestamps: true });

module.exports = mongoose.model('Firm', firmSchema); 