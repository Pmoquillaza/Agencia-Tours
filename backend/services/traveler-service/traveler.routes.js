const express = require('express');

const router = express.Router();

const {

    createTraveler,
    getTravelersByReservation

} = require('./traveler.controller');

const {

    authenticateToken

} = require('../../middleware/auth.middleware');

// =====================================
// CREAR VIAJERO
// =====================================

router.post(

    '/create',

    authenticateToken,

    createTraveler

);

// =====================================
// LISTAR VIAJEROS
// =====================================

router.get(

    '/reservation/:reservationId',

    authenticateToken,

    getTravelersByReservation

);

module.exports = router;