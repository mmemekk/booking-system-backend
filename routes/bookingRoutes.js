const express = require('express');
const router = express.Router();
const bookingControllers = require('../controllers/bookingControllers');

router.get("/:restaurantId", bookingControllers.getBooking);
router.post("/:restaurantId", bookingControllers.createBooking);
router.patch("/:restaurantId/:bookingRef", bookingControllers.updateBooking);
router.delete("/:restaurantId/:bookingRef", bookingControllers.deleteBooking);

module.exports = router;