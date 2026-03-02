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

exports.getTableForBookingByCapacity= async (restaurantId, date, capacity) => {
    try{
        const capacityBuffer = 4; // use to limit the maximum capacity during filtering
        const getAvailabilityWithOutTimeSlot = await this.getAvailabilityWithOutTimeSlot(restaurantId, date);
        const getAvailability = await availabilityHelpers.generateTimeSlotsForAvailability(restaurantId,getAvailabilityWithOutTimeSlot);

        const isBelowMaxCapacity = availabilityHelpers.checkIfRequestedCapacityBelowMaximumCapacity(getAvailability, capacity);

        if(isBelowMaxCapacity == false) {
            return {
                success: false,
                tables: [],
            };
        }

        const filteredAvailableTablesByCapacity = availabilityHelpers.filterAvailability(getAvailability, {...(capacity&&{capacity}), ...(capacityBuffer&&{capacityBuffer})});

        return {
            success: true,
            tables: filteredAvailableTablesByCapacity,
        };

    } catch (error) {
        console.error(error);
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(500, "DATABASE_ERROR", "Failed to fetch availability");
    }
};

exports.getAvailabilityForBooking= async (restaurantId, date, time, capacity, maxAlternative) => {
    try{

        const result = await this.getTableForBookingByCapacity(restaurantId, date, capacity);

        if(!result.success) {
            return {isAvailableAtRequestedTime: false, alternativeTimeSlots: [], reason: "CAPACITY_EXCEED_MAXIMUM", note: "Contact Restaurant Directly for Arrangement"};
        }

        const filteredAvailableTablesByCapacity = result.tables;

        const aggregatedTimeinMs = availabilityHelpers.getAggregatedTimeSlots(filteredAvailableTablesByCapacity);
        console.log("aggregatedTime:", availabilityHelpers.convertAlternativeinMsArraytoTimeArray(aggregatedTimeinMs));

        const isAvailableAtRequestedTime = availabilityHelpers.assertIsAvailableAtRequestedTime(aggregatedTimeinMs, time);
        const alternativeTimeSlots = isAvailableAtRequestedTime ? [] : availabilityHelpers.getAlternativeTimeSlots(aggregatedTimeinMs, time, maxAlternative);
        
        console.log("isAvailableAtRequestedTime:", isAvailableAtRequestedTime);
        console.log("alternativeTimeSlots:", alternativeTimeSlots);

        return {isAvailableAtRequestedTime, alternativeTimeSlots};

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
