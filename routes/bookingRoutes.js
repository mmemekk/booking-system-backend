const express = require('express');
const router = express.Router();
const bookingControllers = require('../controllers/bookingControllers');
const availabilityControllers = require('../controllers/availabilityControllers');

router.get("/:restaurantId", bookingControllers.getBooking);
router.post("/:restaurantId", bookingControllers.createBooking);
router.post("/:restaurantId/manual", bookingControllers.createBookingManual);
router.post("/:restaurantId/check",availabilityControllers.checkAvailabilityForBooking);
router.patch("/:bookingRef", bookingControllers.updateBooking);
router.delete("/:bookingRef", bookingControllers.deleteBooking);

module.exports = router;