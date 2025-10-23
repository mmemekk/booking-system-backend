const express = require("express");
const router = express.Router({ mergeParams: true });
const tableExceptionControllers = require("../controllers/tableExceptionControllers");
const { checkTableIdBelongToRestaurantId } = require("../middleware/checkIdentification");

router.use(checkTableIdBelongToRestaurantId);

router.get("/", tableExceptionControllers.getTableException);
router.post("/", tableExceptionControllers.createTableException);
router.patch("/:exceptionId", tableExceptionControllers.updateTableException);
router.delete("/:exceptionId", tableExceptionControllers.deleteTableException);

module.exports = router;
