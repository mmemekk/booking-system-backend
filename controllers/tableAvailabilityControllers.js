const tableAvailabilityServices = require("../services/tableAvailabilityServices");
const { AppError } = require("../middleware/errorHandler");
const dateTimeFormat = require("../utils/dateTimeFormat");

exports.getTableAvailability = async (req, res, next) => {
  try {

    const tableId = parseInt(req.params.tableId);

    const tableAvailability = await tableAvailabilityServices.getTableAvailability(tableId);

    const formattedTableAvailability =
      dateTimeFormat.formatTimeForTableAvailabilityResponseArray(
        tableAvailability
      );

    return res.json({ formattedTableAvailability });
  } catch (error) {
    next(error);
  }
};

exports.setTableAvailability = async (req, res, next) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId);
    const tableId = parseInt(req.params.tableId);

    const { dayOfWeek, openTime, closeTime, isUseStoreHour } = req.body;

    if (!dayOfWeek || isUseStoreHour == undefined) {
      throw new AppError(
        400,
        "MISSING_INPUT_FIELD",
        "Missing required input fields"
      );
    }

    if (!isUseStoreHour && (!openTime || !closeTime)) {
      throw new AppError(
        400,
        "MISSING_TIME",
        "Open time and close time are required"
      );
    }

    let formattedOpenTime = null;
    let formattedCloseTime = null;

    if (!isUseStoreHour) {
      formattedOpenTime = dateTimeFormat.formatTimeForDatabase(openTime);
      formattedCloseTime = dateTimeFormat.formatTimeForDatabase(closeTime);
    }

    const setTableAvailability =
      await tableAvailabilityServices.setTableAvailability(
        restaurantId,
        tableId,
        {
          dayOfWeek,
          formattedOpenTime,
          formattedCloseTime,
          isUseStoreHour,
        }
      );

    const formattedSetTableAvailability =
      dateTimeFormat.formatTimeForTableAvailabilityResponse(
        setTableAvailability
      );

    return res.status(201).json({ formattedSetTableAvailability });
  } catch (error) {
    next(error);
  }
};

exports.updateTableAvailability = async (req, res, next) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId);
    const tableId = parseInt(req.params.tableId);
    const dayOfWeek = req.params.dayOfWeek;
    const { openTime, closeTime, isUseStoreHour } = req.body;

    if (!dayOfWeek) {
      throw new AppError(400, "MISSING_ID", "Day of week is required");
    }

    if (isUseStoreHour == undefined) {
      throw new AppError(
        400,
        "MISSING_INPUT_FIELD",
        "Missing required input fields"
      );
    }

    if (!isUseStoreHour && (!openTime || !closeTime)) {
      throw new AppError(
        400,
        "MISSING_TIME",
        "Open time and close time are required"
      );
    }

    let formattedOpenTime = null;
    let formattedCloseTime = null;

    if (!isUseStoreHour) {
      formattedOpenTime = dateTimeFormat.formatTimeForDatabase(openTime);
      formattedCloseTime = dateTimeFormat.formatTimeForDatabase(closeTime);
    }

    const updateTableAvailability =
      await tableAvailabilityServices.updateTableAvailability(
        restaurantId,
        tableId,
        {
          dayOfWeek,
          formattedOpenTime,
          formattedCloseTime,
          isUseStoreHour,
        }
      );

    const formattedUpdateTableAvailability =
      dateTimeFormat.formatTimeForTableAvailabilityResponse(
        updateTableAvailability
      );

    return res.json({ formattedUpdateTableAvailability });
  } catch (error) {
    next(error);
  }
};

exports.deleteTableAvailability = async (req, res, next) => {
  try {
    const tableId = parseInt(req.params.tableId);
    const dayOfWeek = req.params.dayOfWeek;

    if (!dayOfWeek) {
      throw new AppError(400, "MISSING_ID", "Day of week is required");
    }

    const deleteTableAvailability =
      await tableAvailabilityServices.deleteTableAvailability(
        tableId,
        dayOfWeek
      );

    const formattedDeleteTableAvailability =
      dateTimeFormat.formatTimeForTableAvailabilityResponse(
        deleteTableAvailability
      );

    return res.json({
      message: "Table Availability deleted successfully",
      formattedDeleteTableAvailability,
    });
  } catch (error) {
    next(error);
  }
};
