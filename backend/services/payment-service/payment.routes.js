const express = require('express');

const router = express.Router();

const {

    createPaymentIntent

} = require('./payment.controller');

const {
    confirmPayment
} = require('./confirmPayment.controller');

const {

    authenticateToken

} = require('../../middleware/auth.middleware');

router.post(
    '/create-intent',
    authenticateToken,
    createPaymentIntent
);

router.post(
    '/confirm',
    authenticateToken,
    confirmPayment
);

module.exports = router;