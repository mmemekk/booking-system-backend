const { PrismaClient } = require("@prisma/client");
const { AppError } = require("../middleware/errorHandler");
const prisma = new PrismaClient();
const dateTimeFormat = require("../utils/dateTimeFormat");

exports.getStoreException = async (restaurantId, filters) => {
  try {
    const { date, upcoming } = filters;
    let where = { restaurantId };

    if (date && upcoming) {
      throw new AppError(
        400,
        "INVALID_FILTER",
        "Cannot use both 'date' and 'upcoming' filters together"
      );
    }

    if (date) {
      const parsedDate = dateTimeFormat.formatDateForDatabase(date);
      where.date = parsedDate;
    }

    if (upcoming) {
      const today = new Date();
      where.date = { gte: today };
    }
    const storeException = await prisma.storeException.findMany({
      where,
      orderBy: { date: "asc" },
    });

    if (!storeException || storeException.length === 0) {
      throw new AppError(
        404,
        "STORE_EXCEPTION_NOT_FOUND",
        "Store exceptions not found for this restaurant"
      );
    }

    return storeException;
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, "DATABASE_ERROR", "Failed to fetch store hours");
  }
};

exports.createStoreException = async (restaurantId, storeExceptionData) => {
  try {
    const storeHour = await prisma.storeException.create({
      data: {
        restaurantId: parseInt(restaurantId),
        date: storeExceptionData.formattedDate,
        openTime: storeExceptionData.formattedOpenTime,
        closeTime: storeExceptionData.formattedCloseTime,
        isClosed: storeExceptionData.isClosed,
        description: storeExceptionData.description,
      },
    });

    return storeHour;
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, "DATABASE_ERROR", "Failed to fetch store hours");
  }
};

exports.updateStoreException = async (
  restaurantId,
  exceptionId,
  storeExceptionData
) => {
  try {
    const updateStoreException = await prisma.storeException.update({
      where: {
        id: exceptionId,
        restaurantId: restaurantId,
      },
      data: {
        date: storeExceptionData.formattedDate,
        openTime: storeExceptionData.formattedOpenTime,
        closeTime: storeExceptionData.formattedCloseTime,
        isClosed: storeExceptionData.isClosed,
        description: storeExceptionData.description,
      },
    });

    return updateStoreException;
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

exports.deleteStoreException = async (restaurantId, exceptionId) => {
  try {
    const deleteStoreException = await prisma.storeException.delete({
      where: {
        id: exceptionId,
        restaurantId: restaurantId,
      },
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
