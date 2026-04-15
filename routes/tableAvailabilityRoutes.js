const express = require("express");
const router = express.Router({ mergeParams: true });
const tableAvailability = require("../controllers/tableAvailabilityControllers");
const {
  checkTableIdBelongToRestaurantId,
} = require("../middleware/checkIdentification");

router.use(checkTableIdBelongToRestaurantId);

router.get("/", tableAvailability.getTableAvailability);
router.post("/", tableAvailability.setTableAvailability);
router.patch("/", tableAvailability.updateTableAvailability);
router.delete("/:dayOfWeek", tableAvailability.deleteTableAvailability);

module.exports = router;
