const express = require('express');

const router = express.Router();

const {

    createFlight,
    deleteFlight,
    getFlights,
    getFlightById,
    updateFlight

} = require('./flight.controller');

const {

    authenticateToken,
    authorizeAdmin

} = require('../../middleware/auth.middleware');

router.post(
    '/create',
    authenticateToken,
    authorizeAdmin,
    createFlight
);

router.get(
    '/list',
    getFlights
);

router.put(
    '/:id',
    authenticateToken,
    authorizeAdmin,
    updateFlight
);

router.delete(
    '/:id',
    authenticateToken,
    authorizeAdmin,
    deleteFlight
);

router.get(
    '/:id',
    getFlightById
);

module.exports = router;
