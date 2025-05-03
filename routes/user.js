const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth, restrictTo } = require('../middleware/auth');

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/home', userController.getHomePackages);

// Protected routes (require authentication)
router.use(auth);
router.use(restrictTo('user'));

// User profile routes
router.get('/profile', userController.getProfile);
router.patch('/profile', userController.updateProfile);

// Trip management routes
router.get('/trips', userController.getTrips);
router.post('/trips/book', userController.bookTrip);

// Logout route
router.post('/logout', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Successfully logged out'
    });
});

module.exports = router; 