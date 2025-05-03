const jwt = require('jsonwebtoken');
const { promisify } = require('util');

// Middleware to verify JWT token
const auth = async (req, res, next) => {
    try {
        // 1) Check if token exists
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                status: 'fail',
                message: 'You are not logged in! Please log in to get access.'
            });
        }

        // 2) Verify token
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

        // 3) Attach user/vendor data to request
        req.user = {
            id: decoded.id,
            role: decoded.role
        };

        next();
    } catch (err) {
        if (err.name === 'JsonWebTokenError') {
            return res.status(403).json({
                status: 'fail',
                message: 'Invalid token. Please log in again!'
            });
        }
        if (err.name === 'TokenExpiredError') {
            return res.status(403).json({
                status: 'fail',
                message: 'Your token has expired! Please log in again.'
            });
        }
        return res.status(403).json({
            status: 'fail',
            message: 'Something went wrong! Please try again.'
        });
    }
};

// Role-based access control middleware
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'fail',
                message: 'You do not have permission to perform this action'
            });
        }
        next();
    };
};

module.exports = {
    auth,
    restrictTo
}; 