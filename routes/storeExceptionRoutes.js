const express = require("express");
const router = express.Router({ mergeParams: true });
const storeExceptionControllers = require("../controllers/storeExceptionControllers");

router.get("/", storeExceptionControllers.getStoreException);
router.post("/", storeExceptionControllers.createStoreException);
router.patch("/:exceptionId", storeExceptionControllers.updateStoreException);
router.delete("/:exceptionId", storeExceptionControllers.deleteStoreException);

module.exports = router;