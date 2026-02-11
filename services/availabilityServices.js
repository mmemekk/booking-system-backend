const { PrismaClient } = require("@prisma/client");
const { AppError } = require("../middleware/errorHandler");
const prisma = new PrismaClient();
const availabilityHelpers = require("./availabilityHelpers");
const { get } = require("../routes/tableAvailabilityRoutes");

exports.getAvailabilityWithOutTimeSlot = async (restaurantId, date, time, capacity) => {
    try{
        const storeHourAfterException = await availabilityHelpers.getStoreHourAfterException(restaurantId, date);
        const tableAvailabilityAfterExceptionAndBooking = await availabilityHelpers.getTableAvailabilityAfterExceptionAndBooking(restaurantId, date);
        const availableTables = availabilityHelpers.getTableAvailabilityAfterStoreHour(storeHourAfterException, tableAvailabilityAfterExceptionAndBooking);
        
        return availableTables;
    } catch (error) {
        console.error(error);
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(500, "DATABASE_ERROR", "Failed to fetch availability");
    }
};

exports.getAvailability= async (restaurantId, date, time, capacity) => {
    try{

        const getAvailabilityWithOutTimeSlot = await this.getAvailabilityWithOutTimeSlot(restaurantId, date, time, capacity);
        const getAvailability = await availabilityHelpers.generateTimeSlotsForAvailability(restaurantId,getAvailabilityWithOutTimeSlot);

        return getAvailability;

    } catch (error) {
        console.error(error);
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(500, "DATABASE_ERROR", "Failed to fetch availability");
    }
};

exports.getStoreHourWithOutTimeSlot = async (restaurantId, date) => {
    try{

        return await availabilityHelpers.getStoreHourAfterException(restaurantId, date);

    } catch (error) {
        console.error(error);
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(500, "DATABASE_ERROR", "Failed to fetch availability");
    }
};

exports.getTableAvailabilityWithOutTimeSlot = async (restaurantId, date) => {
    try{
        
        return await availabilityHelpers.getTableAvailabilityAfterExceptionAndBooking(restaurantId, date);

    } catch (error) {
        console.error(error);
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(500, "DATABASE_ERROR", "Failed to fetch availability");
    }
};
