const { PrismaClient } = require("@prisma/client");
const { AppError } = require("../middleware/errorHandler");
const prisma = new PrismaClient();

const {
    getStoreHourAfterException,
    getTableAvailabilityAfterException,
    getTableAvailabilityAfterStoreHour,
} = require("./availabilityHelpers");

exports.getAvailability = async (restaurantId, date, time, capacity) => {
    try{
        
        const storeHourAfterException = await getStoreHourAfterException(restaurantId, date);
        const tableAvailabilityAfterException = await getTableAvailabilityAfterException(restaurantId, date);

        const availableTables = getTableAvailabilityAfterStoreHour(storeHourAfterException, tableAvailabilityAfterException);

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

        return await getStoreHourAfterException(restaurantId, date);

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
        
        return await getTableAvailabilityAfterExceptionAndBooking(restaurantId, date);

    } catch (error) {
        console.error(error);
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(500, "DATABASE_ERROR", "Failed to fetch availability");
    }
};
