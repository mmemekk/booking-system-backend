const { PrismaClient } = require("@prisma/client");
const { AppError } = require("../middleware/errorHandler");
const prisma = new PrismaClient();

exports.getTableAvailability = async (tableId) => {
  try {
    const tableAvailability = await prisma.tableAvailability.findMany({
      where: {
        tableId: parseInt(tableId),
      },
      orderBy: {
        dayOfWeek: "asc",
      },
    });

    if (!tableAvailability || tableAvailability.length === 0) {
      throw new AppError(
        404,
        "STORE_HOUR_NOT_FOUND",
        "Store hours not found for this restaurant",
      );
    }

    return tableAvailability;
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, "DATABASE_ERROR", "Failed to fetch store hours");
  }
};

exports.setTableAvailability = async (
  restaurantId,
  tableId,
  tableAvailabilityData,
) => {
  try {
    const days = Array.isArray(tableAvailabilityData.dayOfWeek)
      ? tableAvailabilityData.dayOfWeek
      : [tableAvailabilityData.dayOfWeek];

    const createdAvailabilities = [];

    for (const dayOfWeek of days) {
      let openTime = tableAvailabilityData.formattedOpenTime;
      let closeTime = tableAvailabilityData.formattedCloseTime;

      if (tableAvailabilityData.isUseStoreHour === true) {
        const storeHour = await prisma.storeHour.findUnique({
          where: {
            restaurantId_dayOfWeek: {
              restaurantId: parseInt(restaurantId),
              dayOfWeek,
            },
          },
        });

        if (storeHour.openTime == null || storeHour.closeTime == null) {
          throw new AppError(
            404,
            "STORE_HOUR_NOT_FOUND",
            "Store hour not found for this restaurant and day",
          );
        }

        openTime = storeHour.openTime;
        closeTime = storeHour.closeTime;
      }

      const setTableAvailability = await prisma.tableAvailability.create({
        data: {
          tableId: tableId,
          dayOfWeek,
          openTime,
          closeTime,
        },
      });

      createdAvailabilities.push(setTableAvailability);
    }

    return createdAvailabilities;
  } catch (error) {
    console.error(error);

    if (error instanceof AppError) {
      throw error;
    }

    if (error.code === "P2002") {
      throw new AppError(
        400,
        "TABLE_AVAILABILITY_CONFLICT",
        "Table Availability already exists for this day of the week",
      );
    }

    throw new AppError(500, "DATABASE_ERROR", "Failed to create restaurant");
  }
};

exports.updateTableAvailability = async (
  restaurantId,
  tableId,
  tableAvailabilityData,
) => {
  try {
    const days = Array.isArray(tableAvailabilityData.dayOfWeek)
      ? tableAvailabilityData.dayOfWeek
      : [tableAvailabilityData.dayOfWeek];

    const updatedAvailabilities = [];

    for (const dayOfWeek of days) {
      let openTime = tableAvailabilityData.formattedOpenTime;
      let closeTime = tableAvailabilityData.formattedCloseTime;

      if (tableAvailabilityData.isUseStoreHour === true) {
        const storeHour = await prisma.storeHour.findUnique({
          where: {
            restaurantId_dayOfWeek: {
              restaurantId: parseInt(restaurantId),
              dayOfWeek,
            },
          },
        });

        if (storeHour.openTime == null || storeHour.closeTime == null) {
          throw new AppError(
            404,
            "STORE_HOUR_NOT_FOUND",
            "Store hour not found for this restaurant and day",
          );
        }

        openTime = storeHour.openTime;
        closeTime = storeHour.closeTime;
      }

      const updateTableAvailability = await prisma.tableAvailability.update({
        where: {
          tableId_dayOfWeek: {
            tableId: parseInt(tableId),
            dayOfWeek,
          },
        },
        data: {
          openTime,
          closeTime,
        },
      });

      updatedAvailabilities.push(updateTableAvailability);
    }

    return updatedAvailabilities;
  } catch (error) {
    console.error(error);

    if (error instanceof AppError) {
      throw error;
    }

    if (error.code === "P2025") {
      throw new AppError(
        404,
        "TABLE_AVAILABILITY_NOT_FOUND",
        "Table Availability not found",
      );
    }

    throw new AppError(500, "DATABASE_ERROR", "Failed to update store hours");
  }
};

exports.updateAllTableAvailability = async (
  restaurantId,
  tableAvailabilityData,
) => {
  try {
    const days = Array.isArray(tableAvailabilityData.dayOfWeek)
      ? tableAvailabilityData.dayOfWeek
      : [tableAvailabilityData.dayOfWeek];

    const restaurantTables = await prisma.table.findMany({
      where: { restaurantId: parseInt(restaurantId) },
      select: { id: true },
    });

    if (!restaurantTables || restaurantTables.length === 0) {
      throw new AppError(
        404,
        "TABLES_NOT_FOUND",
        "No tables found for this restaurant",
      );
    }

    const updatedAvailabilities = [];

    for (const dayOfWeek of days) {
      let openTime = tableAvailabilityData.formattedOpenTime;
      let closeTime = tableAvailabilityData.formattedCloseTime;

      if (tableAvailabilityData.isUseStoreHour === true) {
        const storeHour = await prisma.storeHour.findUnique({
          where: {
            restaurantId_dayOfWeek: {
              restaurantId: parseInt(restaurantId),
              dayOfWeek,
            },
          },
        });

        if (storeHour.openTime == null || storeHour.closeTime == null) {
          throw new AppError(
            404,
            "STORE_HOUR_NOT_FOUND",
            "Store hour not found for this restaurant and day",
          );
        }

        openTime = storeHour.openTime;
        closeTime = storeHour.closeTime;
      }

      for (const table of restaurantTables) {
        const updateTableAvailability = await prisma.tableAvailability.update({
          where: {
            tableId_dayOfWeek: {
              tableId: table.id,
              dayOfWeek,
            },
          },
          data: {
            openTime,
            closeTime,
          },
        });

        updatedAvailabilities.push(updateTableAvailability);
      }
    }

    return updatedAvailabilities;
  } catch (error) {
    console.error(error);

    if (error instanceof AppError) {
      throw error;
    }

    if (error.code === "P2025") {
      throw new AppError(
        404,
        "TABLE_AVAILABILITY_NOT_FOUND",
        "Table Availability not found",
      );
    }

    throw new AppError(500, "DATABASE_ERROR", "Failed to update store hours");
  }
};

exports.deleteTableAvailability = async (tableId, dayOfWeek) => {
  try {
    const deleteStoreException = await prisma.tableAvailability.delete({
      where: {
        tableId_dayOfWeek: {
          tableId: parseInt(tableId),
          dayOfWeek: dayOfWeek,
        },
      },
    });

    return deleteStoreException;
  } catch (error) {
    console.error(error);

    if (error.code === "P2025") {
      // Prisma not found error
      throw new AppError(
        404,
        "TABLE_AVAILABILITY_NOT_FOUND",
        "Table Availability not found",
      );
    }

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(500, "DATABASE_ERROR", "Failed to fetch store hours");
  }
};
