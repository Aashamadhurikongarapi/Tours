const User = require('../models/User');
const Trip = require('../models/Trip');
const Package = require('../models/Package');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper function to create JWT token
const signToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

// Register new user
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                status: 'fail',
                message: 'User with this email already exists'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create new user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'user'
        });

        // Create token
        const token = signToken(user._id, user.role);

        res.status(201).json({
            status: 'success',
            token,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
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

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                status: 'fail',
                message: 'Invalid email or password'
            });
        }

        // Verify password
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                status: 'fail',
                message: 'Invalid email or password'
            });
        }

        // Create token
        const token = signToken(user._id, user.role);

        res.status(200).json({
            status: 'success',
            token,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
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

// Get user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({
            status: 'success',
            data: {
                user
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;

        // Check if email is being changed and if it's already taken
        if (email) {
            const existingUser = await User.findOne({ email });
            if (existingUser && existingUser._id.toString() !== req.user.id) {
                return res.status(400).json({
                    status: 'fail',
                    message: 'Email already in use'
                });
            }
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { name, email },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            status: 'success',
            data: {
                user
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

// Get home page packages
exports.getHomePackages = async (req, res) => {
    try {
        // Build query object based on query parameters
        const queryObj = {};

        // Filter by region
        if (req.query.region) {
            queryObj.region = req.query.region;
        }

        // Filter by maximum budget
        if (req.query.budget) {
            queryObj.budget = { $lte: Number(req.query.budget) };
        }

        // Filter by maximum duration
        if (req.query.duration) {
            queryObj.duration = { $lte: Number(req.query.duration) };
        }

        // Get all packages with their firm details
        const packages = await Package.find(queryObj)
            .populate('firm', 'name description')
            .sort({ createdAt: -1 });

        res.status(200).json({
            status: 'success',
            results: packages.length,
            data: {
                packages
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

// Get user trips
exports.getTrips = async (req, res) => {
    try {
        // Get upcoming trips
        const upcomingTrips = await Trip.find({
            user: req.user.id,
            status: 'upcoming'
        }).populate('package firm');

        // Get past trips
        const pastTrips = await Trip.find({
            user: req.user.id,
            status: 'completed'
        }).populate('package firm');

        res.status(200).json({
            status: 'success',
            data: {
                upcomingTrips,
                pastTrips
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

// Book a trip
exports.bookTrip = async (req, res) => {
    try {
        const { packageId, startDate, endDate, numberOfPeople } = req.body;

        // Get package details
        const package = await Package.findById(packageId).populate('firm');
        if (!package) {
            return res.status(404).json({
                status: 'fail',
                message: 'Package not found'
            });
        }

        // Create new trip
        const trip = await Trip.create({
            user: req.user.id,
            package: packageId,
            firm: package.firm._id,
            startDate,
            endDate,
            numberOfPeople,
            status: 'upcoming',
            totalAmount: package.budget * numberOfPeople
        });

        // Update user's upcoming trips
        await User.findByIdAndUpdate(
            req.user.id,
            { $push: { upcomingTrips: trip._id } }
        );

        res.status(201).json({
            status: 'success',
            data: {
                trip
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
}; 