const express = require('express');

const router = express.Router();

const {

    sendReservationEmail

} = require('./notification.controller');

const {

    authenticateToken

} = require('../../middleware/auth.middleware');

router.post(
    '/send',
    authenticateToken,
    sendReservationEmail
);

module.exports = router;