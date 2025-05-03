const Vendor = require('../models/Vendor');
const Firm = require('../models/Firm');
const Package = require('../models/Package');
const Trip = require('../models/Trip');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper function to create JWT token
const signToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

// Register new vendor
exports.register = async (req, res) => {
    try {
        const { name, email, password, firmName, firmDescription } = req.body;

        // Check if vendor already exists
        const existingVendor = await Vendor.findOne({ email });
        if (existingVendor) {
            return res.status(400).json({
                status: 'fail',
                message: 'Vendor with this email already exists'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create new vendor
        const vendor = await Vendor.create({
            name,
            email,
            password: hashedPassword,
            role: 'vendor'
        });

        // Create firm for the vendor
        const firm = await Firm.create({
            name: firmName,
            description: firmDescription,
            vendor: vendor._id
        });

        // Update vendor with firm reference
        vendor.firm = firm._id;
        await vendor.save();

        // Create token
        const token = signToken(vendor._id, vendor.role);

        res.status(201).json({
            status: 'success',
            token,
            data: {
                vendor: {
                    id: vendor._id,
                    name: vendor.name,
                    email: vendor.email,
                    firm: {
                        id: firm._id,
                        name: firm.name
                    }
                }
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

// Login vendor
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if vendor exists
        const vendor = await Vendor.findOne({ email }).select('+password');
        if (!vendor) {
            return res.status(401).json({
                status: 'fail',
                message: 'Invalid email or password'
            });
        }

        // Verify password
        const isPasswordCorrect = await bcrypt.compare(password, vendor.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                status: 'fail',
                message: 'Invalid email or password'
            });
        }

        // Create token
        const token = signToken(vendor._id, vendor.role);

        res.status(200).json({
            status: 'success',
            token,
            data: {
                vendor: {
                    id: vendor._id,
                    name: vendor.name,
                    email: vendor.email
                }
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

// Get vendor profile
exports.getProfile = async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.user.id).populate('firm');
        res.status(200).json({
            status: 'success',
            data: {
                vendor
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

// Update vendor profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;

        // Check if email is being changed and if it's already taken
        if (email) {
            const existingVendor = await Vendor.findOne({ email });
            if (existingVendor && existingVendor._id.toString() !== req.user.id) {
                return res.status(400).json({
                    status: 'fail',
                    message: 'Email already in use'
                });
            }
        }

        const vendor = await Vendor.findByIdAndUpdate(
            req.user.id,
            { name, email },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            status: 'success',
            data: {
                vendor
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

// Add firm for vendor
exports.addFirm = async (req, res) => {
    try {
        const { name, description } = req.body;

        // Check if vendor already has a firm
        const vendor = await Vendor.findById(req.user.id);
        if (vendor.firm) {
            return res.status(400).json({
                status: 'fail',
                message: 'Vendor already has a firm'
            });
        }

        // Create new firm
        const firm = await Firm.create({
            name,
            description,
            vendor: req.user.id
        });

        // Update vendor with firm reference
        vendor.firm = firm._id;
        await vendor.save();

        res.status(201).json({
            status: 'success',
            data: {
                firm
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

// Add package to firm
exports.addPackages = async (req, res) => {
    try {
        const { title, description, region, budget, duration } = req.body;

        // Get vendor's firm
        const vendor = await Vendor.findById(req.user.id).populate('firm');
        if (!vendor.firm) {
            return res.status(400).json({
                status: 'fail',
                message: 'Vendor does not have a firm'
            });
        }

        // Create new package
        const newPackage = await Package.create({
            title,
            description,
            region,
            budget,
            duration,
            firm: vendor.firm._id
        });

        // Add package to firm's packages array
        vendor.firm.packages.push(newPackage._id);
        await vendor.firm.save();

        res.status(201).json({
            status: 'success',
            data: {
                package: newPackage
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

// Get all trips related to vendor's firm packages
exports.getTrips = async (req, res) => {
    try {
        // Get vendor's firm
        const vendor = await Vendor.findById(req.user.id).populate('firm');
        const firm = vendor.firm;

        // Get all packages of the firm
        const packages = await Package.find({ firm: firm._id });

        // Get all trips for these packages
        const trips = await Trip.find({
            package: { $in: packages.map(p => p._id) }
        }).populate('user package');

        res.status(200).json({
            status: 'success',
            results: trips.length,
            data: {
                trips
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
}; 