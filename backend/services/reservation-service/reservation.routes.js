const express = require('express');

const router = express.Router();

const {

    cancelReservation,
    createReservation,
    getReservations,
    getReservationById

} = require('./reservation.controller');

const {

    authenticateToken

} = require('../../middleware/auth.middleware');

// =========================
// CREAR RESERVA
// =========================

router.post(
    '/create',
    authenticateToken,
    createReservation
);

// =========================
// LISTAR RESERVAS
// =========================

router.get(
    '/list',
    authenticateToken,
    getReservations
);

// =========================
// CANCELAR RESERVA
// =========================

router.post(
    '/:id/cancel',
    authenticateToken,
    cancelReservation
);

// =========================
// OBTENER RESERVA POR ID
// =========================

router.get(
    '/:id',
    authenticateToken,
    getReservationById
);

router.get(
    "/",
    authenticateToken,
    getReservations
);

module.exports = router;
