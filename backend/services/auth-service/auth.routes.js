const express = require('express');

const router = express.Router();

const {

    registerUser,
    loginUser,
    verifyAuthCode,
    getProfile,
    updateProfile

} = require('./auth.controller');

const {
    authenticateToken
} = require('../../middleware/auth.middleware');

router.post('/register', registerUser);

router.post('/login', loginUser);

router.post('/verify-code', verifyAuthCode);

router.get(
    '/profile',
    authenticateToken,
    getProfile
);

router.put(
    '/profile',
    authenticateToken,
    updateProfile
);

module.exports = router;
