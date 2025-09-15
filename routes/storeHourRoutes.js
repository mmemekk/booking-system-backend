const express = require("express");
const router = express.Router({ mergeParams: true });
const storeHourControllers = require("../controllers/storeHourControllers");

router.get("/", storeHourControllers.getStoreHour);
router.post("/", storeHourControllers.setStoreHour);
router.patch("/:dayOfWeek", storeHourControllers.updateStoreHour);
router.delete("/:dayOfWeek", storeHourControllers.deleteStoreHour);

module.exports = router;