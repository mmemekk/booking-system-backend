const { PrismaClient } = require("@prisma/client");
const { AppError } = require("../middleware/errorHandler");
const prisma = new PrismaClient();
const availabilityHelpers = require("./availabilityHelpers");
const { get } = require("../routes/tableAvailabilityRoutes");

exports.getAvailabilityWithOutTimeSlot = async (restaurantId, date, capacity) => {
    try{
        const storeHourAfterException = await availabilityHelpers.getStoreHourAfterException(restaurantId, date);
        const tableAvailabilityAfterExceptionAndBooking = await availabilityHelpers.getTableAvailabilityAfterExceptionAndBooking(restaurantId, date);
        const availableTables = await availabilityHelpers.getTableAvailabilityAfterStoreHour(storeHourAfterException, tableAvailabilityAfterExceptionAndBooking);
        
        if(capacity) {
            const filteredAvailableTables = availabilityHelpers.filterAvailability(availableTables, {"capacity": capacity});
            return filteredAvailableTables;
        }

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

        const getAvailabilityWithOutTimeSlot = await this.getAvailabilityWithOutTimeSlot(restaurantId, date);
        const getAvailability = await availabilityHelpers.generateTimeSlotsForAvailability(restaurantId,getAvailabilityWithOutTimeSlot);

        if(time || capacity) {
            const filteredAvailableTables = availabilityHelpers.filterAvailability(getAvailability, {...(time&&{time}), ...(capacity&&{capacity})});
            return filteredAvailableTables;
        }

        return getAvailability;

    } catch (error) {
        console.error(error);
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(500, "DATABASE_ERROR", "Failed to fetch availability");
    }
};

exports.getEffectiveStoreHour = async (restaurantId, date) => {
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

exports.getEffectiveTableAvailability = async (restaurantId, date) => {
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
