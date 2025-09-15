const storeExceptionServices = require("../services/storeExceptionServices");
const { AppError } = require("../middleware/errorHandler");
const dateTimeFormat = require("../utils/dateTimeFormat");

exports.getStoreException = async (req, res, next) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId);
    if (!restaurantId || isNaN(restaurantId)) {
      throw new AppError(400, "MISSING_ID", "Restaurant ID is required");
    }

    const { date, upcoming } = req.query;

    const storeException = await storeExceptionServices.getStoreException(
      restaurantId,
      {
        date,
        upcoming,
      }
    );

    const formattedStoreException =
      dateTimeFormat.formatDateTimeForStoreExceptionResponseArray(
        storeException
      );

    return res.json({ formattedStoreException });
  } catch (error) {
    next(error);
  }
};


exports.createStoreException = async (req, res, next) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId);
    if (!restaurantId || isNaN(restaurantId)) {
      throw new AppError(400, "MISSING_ID", "Restaurant ID is required");
    }

    const { date, openTime, closeTime, isClosed, description } = req.body;

    if (!date || isClosed == undefined) {
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

    const formattedDate = dateTimeFormat.formatDateForDatabase(date);

    let formattedOpenTime = null;
    let formattedCloseTime = null;

    if (!isClosed) {
      formattedOpenTime = dateTimeFormat.formatTimeForDatabase(openTime);
      formattedCloseTime = dateTimeFormat.formatTimeForDatabase(closeTime);
    }

    const createStoreException =
      await storeExceptionServices.createStoreException(restaurantId, {
        formattedDate,
        formattedOpenTime,
        formattedCloseTime,
        isClosed,
        description,
      });

    const formattedCreateStoreException =
      dateTimeFormat.formatDateTimeForStoreExceptionResponse(
        createStoreException
      );

    return res.status(201).json({ formattedCreateStoreException });
  } catch (error) {
    next(error);
  }
};

exports.updateStoreException = async (req, res, next) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId);
    const exceptionId = parseInt(req.params.exceptionId);

    if (!restaurantId || isNaN(restaurantId)) {
      throw new AppError(400, "MISSING_ID", "Restaurant ID is required");
    }
    if (!exceptionId || isNaN(exceptionId)) {
      throw new AppError(400, "MISSING_ID", "Exception ID is required");
    }

    const { date, openTime, closeTime, isClosed, description } = req.body;

    const formattedDate = date
      ? dateTimeFormat.formatDateForDatabase(date)
      : undefined;
    const formattedOpenTime = openTime
      ? dateTimeFormat.formatTimeForDatabase(openTime)
      : undefined;
    const formattedCloseTime = closeTime
      ? dateTimeFormat.formatTimeForDatabase(closeTime)
      : undefined;

    const updateStoreException =
      await storeExceptionServices.updateStoreException(
        restaurantId,
        exceptionId,
        {
          formattedDate,
          formattedOpenTime,
          formattedCloseTime,
          isClosed,
          description,
        }
      );

    const formattedUpdateStoreException =
      dateTimeFormat.formatDateTimeForStoreExceptionResponse(
        updateStoreException
      );

    return res.json({ formattedUpdateStoreException });
  } catch (error) {
    next(error);
  }
};

exports.deleteStoreException  = async (req, res, next) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId);
    const exceptionId = parseInt(req.params.exceptionId);

    if (!restaurantId || isNaN(restaurantId)) {
      throw new AppError(400, "MISSING_ID", "Restaurant ID is required");
    }
    if (!exceptionId || isNaN(exceptionId)) {
      throw new AppError(400, "MISSING_ID", "Exception ID is required");
    }

    const deleteStoreException =
      await storeExceptionServices.deleteStoreException(
        restaurantId,
        exceptionId
      );

    const formattedDeletedStoreHour =
      dateTimeFormat.formatDateTimeForStoreExceptionResponse(
        deleteStoreException
      );

    return res.json({
      message: "Store Exception deleted successfully",
      formattedDeletedStoreHour,
    });
  } catch (error) {
    next(error);
  }
};
