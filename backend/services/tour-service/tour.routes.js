const express = require('express');

const router = express.Router();

const {

    createTour,
    getTours,
    getTourById,
    updateTour,
    deleteTour

} = require('./tour.controller');

const {

    authenticateToken,
    authorizeAdmin

} = require('../../middleware/auth.middleware');

router.get('/list', getTours);

router.get('/:id', getTourById);

router.post(
    '/create',
    authenticateToken,
    authorizeAdmin,
    createTour
);

router.put(
    '/:id',
    authenticateToken,
    authorizeAdmin,
    updateTour
);

router.delete(
    '/:id',
    authenticateToken,
    authorizeAdmin,
    deleteTour
);

module.exports = router;