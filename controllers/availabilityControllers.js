const availabilityServices = require("../services/availabilityServices");
const { AppError } = require("../middleware/errorHandler");
const dateTimeFormat = require("../utils/dateTimeFormat");

exports.getAvailability = async (req, res, next) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId);
    const { date, time, capacity } = req.query;

    if (!restaurantId || isNaN(restaurantId)) {
      throw new AppError(400, "MISSING_ID", "Restaurant ID is required");
    }

    if(!date) {
      throw new AppError(400, "MISSING_QUERY_PARAM", "Missing required query parameters");
    }

    const formattedDate = dateTimeFormat.formatDateForDatabase(date);
    const formattedTime = time ? dateTimeFormat.formatTimeForDatabase(time) : undefined;
    const formattedCapacity = capacity ? parseInt(capacity) : undefined;

    const getAvailability= await availabilityServices.getAvailability(
      restaurantId,
      formattedDate,
      formattedTime,
      formattedCapacity
    );

    const formattedGetAvailability = dateTimeFormat.formatDateTimeForGetAvailabilityResponseArray(getAvailability);

    return res.json({ date, formattedGetAvailability });

  } catch (error) {
    next(error);
  }
};

exports.getAvailabilityWithOutTimeSlot = async (req, res, next) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId);
    const { date, time, capacity } = req.query;

    if (!restaurantId || isNaN(restaurantId)) {
      throw new AppError(400, "MISSING_ID", "Restaurant ID is required");
    }

    if(!date) {
      throw new AppError(400, "MISSING_QUERY_PARAM", "Missing required query parameters");
    }

    const formattedDate = dateTimeFormat.formatDateForDatabase(date);
    const formattedTime = time ? dateTimeFormat.formatTimeForDatabase(time) : undefined;
    const formattedCapacity = capacity ? parseInt(capacity) : undefined;

    const getAvailabilityWithOutTimeSlot = await availabilityServices.getAvailabilityWithOutTimeSlot(
      restaurantId,
      formattedDate,
      formattedTime,
      formattedCapacity
    );

    const formattedGetAvailabilityWithOutTimeSlot = dateTimeFormat.formatDateTimeForAvailabilityWithOutTimeSlotResponseArray(getAvailabilityWithOutTimeSlot);

    return res.json({ date, formattedGetAvailabilityWithOutTimeSlot });

  } catch (error) {
    next(error);
  }
};

exports.getStoreHourWithOutTimeSlot = async (req, res, next) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId);
    const { date } = req.query;

    if (!restaurantId || isNaN(restaurantId)) {
      throw new AppError(400, "MISSING_ID", "Restaurant ID is required");
    }

    if(!date) {
      throw new AppError(400, "MISSING_QUERY_PARAM", "Missing required query parameters");
    }

    const formattedDate = dateTimeFormat.formatDateForDatabase(date);

    const getStoreHourWithOutTimeSlot = await availabilityServices.getStoreHourWithOutTimeSlot(
      restaurantId,
      formattedDate
    );

    const formattedGetStoreHourWithOutTimeSlot = dateTimeFormat.formatDateTimeForStoreHourWithOutTimeSlotResponse(getStoreHourWithOutTimeSlot);

    return res.json({ formattedGetStoreHourWithOutTimeSlot });

  } catch (error) {
    next(error);
  }
};

exports.getTableAvailabilityWithOutTimeSlot = async (req, res, next) => {
  try {
    const restaurantId = parseInt(req.params.restaurantId);
    const { date } = req.query;

    if (!restaurantId || isNaN(restaurantId)) {
      throw new AppError(400, "MISSING_ID", "Restaurant ID is required");
    }

    if(!date) {
      throw new AppError(400, "MISSING_QUERY_PARAM", "Missing required query parameters");
    }

    const formattedDate = dateTimeFormat.formatDateForDatabase(date);

    const getTableAvailabilityWithOutTimeSlot = await availabilityServices.getTableAvailabilityWithOutTimeSlot(
      restaurantId,
      formattedDate
    );

    const formattedGetTableAvailabilityWithOutTimeSlot = dateTimeFormat.formatDateTimeForTableAvailabilityWithOutTimeSlotResponseArray(getTableAvailabilityWithOutTimeSlot);

    return res.json({ formattedGetTableAvailabilityWithOutTimeSlot });

  } catch (error) {
    next(error);
  }
};