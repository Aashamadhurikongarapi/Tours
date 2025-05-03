const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const { auth, restrictTo } = require('../middleware/auth');

// Public routes
router.post('/register', vendorController.register);
router.post('/login', vendorController.login);

// Protected routes (require authentication)
router.use(auth);
router.use(restrictTo('vendor'));

// Firm management routes
router.post('/firm/add-firm', vendorController.addFirm);
router.post('/firm/add-packages', vendorController.addPackages);

// Trip management routes
router.get('/trips', vendorController.getTrips);

// Logout route
router.post('/logout', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Successfully logged out'
    });
});

module.exports = router; 