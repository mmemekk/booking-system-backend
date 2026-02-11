const express = require('express');
const router = express.Router({ mergeParams: true });
const availabilityControllers = require('../controllers/availabilityControllers');

//Availability after considering store hours and table availability
router.get("/", availabilityControllers.getAvailability); //query params: date,time,capacity
router.get("/with-out-time-slot", availabilityControllers.getAvailabilityWithOutTimeSlot); //query params: date,time,capacity

//Effective availability for each module
router.get("/store-hour", availabilityControllers.getEffectiveStoreHour); //query params: date
router.get("/table", availabilityControllers.getEffectiveTableAvailability); //query params: date

module.exports = router;