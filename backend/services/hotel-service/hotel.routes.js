const express = require("express");

const router = express.Router();

const {
    createHotel,
    deleteHotel,
    updateHotel,
    getHotels
} = require("./hotel.controller");

const {
    authenticateToken,
    authorizeAdmin
} = require("../../middleware/auth.middleware");

router.post(
    "/create",
    authenticateToken,
    authorizeAdmin,
    createHotel
);

router.get(
    "/list",
    getHotels
);

router.put(
    "/:id",
    authenticateToken,
    authorizeAdmin,
    updateHotel
);

router.delete(
    "/:id",
    authenticateToken,
    authorizeAdmin,
    deleteHotel
);

module.exports = router;
