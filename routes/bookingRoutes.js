const express = require('express');
const router = express.Router();
const bookingControllers = require('../controllers/bookingControllers');

router.get("/:restaurantId", bookingControllers.getBooking);
router.post("/:restaurantId", bookingControllers.createBooking);
router.patch("/:bookingRef", bookingControllers.updateBooking);
router.delete("/:bookingRef", bookingControllers.deleteBooking);

module.exports = router;