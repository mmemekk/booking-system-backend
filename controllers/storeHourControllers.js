const storeHourServices = require("../services/storeHourServices");
const { AppError } = require("../middleware/errorHandler");
const dateTimeFormat = require("../utils/dateTimeFormat");

exports.getStoreHour = async (req, res, next) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId);
    if (!restaurantId || isNaN(restaurantId)) {
      throw new AppError(400, "MISSING_ID", "Restaurant ID is required");
    }

    const storeHour = await storeHourServices.getStoreHour(restaurantId);

    const formattedStoreHours =
      dateTimeFormat.formatTimeForStoreHourResponseArray(storeHour);

    return res.json({ formattedStoreHours });
  } catch (error) {
    next(error);
  }
};

exports.setStoreHour = async (req, res, next) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId);
    if (!restaurantId || isNaN(restaurantId)) {
      throw new AppError(400, "MISSING_ID", "Restaurant ID is required");
    }

    const { dayOfWeek, openTime, closeTime, isClosed } = req.body;

    if (!dayOfWeek || isClosed == undefined) {
      throw new AppError(
        400,
        "MISSING_INPUT_FIELD",
        "Missing required input fields"
      );
    }

    if (!isClosed && (!openTime || !closeTime)) {
      throw new AppError(
        400,
        "MISSING_TIME",
        "Open time and close time are required when store is open"
      );
    }

    let formattedOpenTime = null;
    let formattedCloseTime = null;

    if (!isClosed) {
      formattedOpenTime = dateTimeFormat.formatTimeForDatabase(openTime);
      formattedCloseTime = dateTimeFormat.formatTimeForDatabase(closeTime);
    }

    const setStoreHour = await storeHourServices.setStoreHour(restaurantId, {
      dayOfWeek,
      formattedOpenTime,
      formattedCloseTime,
      isClosed,
    });

    const formattedSetStoreHour =
      dateTimeFormat.formatTimeForStoreHourResponse(setStoreHour);

    return res.status(201).json({ formattedSetStoreHour });
  } catch (error) {
    next(error);
  }
};

exports.updateStoreHour = async (req, res, next) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId);
    const dayOfWeek = req.params.dayOfWeek;

    if (!restaurantId || isNaN(restaurantId)) {
      throw new AppError(400, "MISSING_ID", "Restaurant ID is required");
    }

    if (!dayOfWeek) {
      throw new AppError(400, "MISSING_ID", "Day of week is required");
    }

    const { openTime, closeTime, isClosed } = req.body;

    const formattedOpenTime = openTime
      ? dateTimeFormat.formatTimeForDatabase(openTime)
      : undefined;
    const formattedCloseTime = closeTime
      ? dateTimeFormat.formatTimeForDatabase(closeTime)
      : undefined;

    const setStoreHour = await storeHourServices.updateStoreHour(
      restaurantId,
      dayOfWeek,
      {
        formattedOpenTime,
        formattedCloseTime,
        isClosed,
      }
    );

    const formattedStoreHour =
      dateTimeFormat.formatTimeForStoreHourResponse(setStoreHour);

    return res.json({ formattedStoreHour });
  } catch (error) {
    next(error);
  }
};

exports.deleteStoreHour = async (req, res, next) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId);
    const dayOfWeek = req.params.dayOfWeek;

    if (!restaurantId || isNaN(restaurantId) || !dayOfWeek) {
      throw new AppError(400, "MISSING_ID", "Restaurant ID is required");
    }

    const deletedStoreHour = await storeHourServices.deleteStoreHour(
      restaurantId,
      dayOfWeek
    );

    const formattedDeletedStoreHour =
      dateTimeFormat.formatTimeForStoreHourResponse(deletedStoreHour);

    return res.json({
      message: "Store Hour deleted successfully",
      formattedDeletedStoreHour,
    });
  } catch (error) {
    next(error);
  }
};
