const { PrismaClient } = require("@prisma/client");
const { AppError } = require("../middleware/errorHandler");
const prisma = new PrismaClient();


exports.getStoreHour = async (restaurantId) => {
    try{
        const storeHour = await prisma.storeHour.findMany({
            where: { 
                restaurantId: parseInt(restaurantId) 
            },
            orderBy: {
                dayOfWeek: 'asc'
            }
        });

        if (!storeHour || storeHour.length === 0) { 
            throw new AppError(404, "STORE_HOUR_NOT_FOUND", "Store hours not found for this restaurant");
        }

        return storeHour;

    } catch (error) {
        console.error(error);
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(500, "DATABASE_ERROR", "Failed to fetch store hours");
    }
};

exports.setStoreHour = async (restaurantId, storeHourData) => {
    try{
        const storeHour = await prisma.storeHour.create({
            data: {
                restaurantId: parseInt(restaurantId),
                dayOfWeek: storeHourData.dayOfWeek,
                openTime: storeHourData.formattedOpenTime,  
                closeTime: storeHourData.formattedCloseTime,
                isClosed: storeHourData.isClosed
            }
        });

        return storeHour;

    } catch (error) {
        console.error(error);
    
        if (error instanceof AppError) {
            throw error;
        }

        if(error.code === 'P2002') {
            throw new AppError(400, "STORE_HOUR_CONFLICT", "Store hour already exists for this day of the week");
        }
        if(error.code === 'P2023') {
            throw new AppError(404, "WRONG_RESTAURANT_ID", "Restaurant ID does not exist");
        }

        throw new AppError(500, "DATABASE_ERROR", "Failed to create restaurant");
    }
};

exports.updateStoreHour = async (restaurantId, dayOfWeek, updateStoreHourData) => {
    try {
        const storeHour = await prisma.storeHour.update({
            where: {
                restaurantId_dayOfWeek: {
                    restaurantId: parseInt(restaurantId),
                    dayOfWeek: dayOfWeek
                }
            },
            data: {
                openTime: updateStoreHourData.formattedOpenTime,
                closeTime: updateStoreHourData.formattedCloseTime,
                isClosed: updateStoreHourData.isClosed
            }
        });

        return storeHour;

    } catch (error) {
        console.error(error);

        if (error instanceof AppError) {
            throw error;
        }

        if (error.code === 'P2025') {
            throw new AppError(404, "STORE_HOUR_NOT_FOUND", 
                "Store hour not found for this restaurant and day");
        }

        if (error.code === 'P2023') {
            throw new AppError(400, "INVALID_INPUT", 
                "Invalid restaurant ID or day of week");
        }

        throw new AppError(500, "DATABASE_ERROR", "Failed to update store hours");
    }
};

exports.deleteStoreHour = async (restaurantId, dayOfWeek) => {
    try{
        const deleteStoreException = await prisma.storeHour.delete({
            where: {
                restaurantId_dayOfWeek: {
                    restaurantId,
                    dayOfWeek
                }
            }
        });

        return deleteStoreException;

    } catch (error) {
        console.error(error);

        if (error.code === "P2025") {
        // Prisma not found error
        throw new AppError(404, "NOT_FOUND", "Store exception not found");
        }

        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(500, "DATABASE_ERROR", "Failed to fetch store hours");
    }
};