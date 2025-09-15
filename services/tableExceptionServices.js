const { PrismaClient } = require("@prisma/client");
const { AppError } = require("../middleware/errorHandler");
const prisma = new PrismaClient();
const dateTimeFormat = require("../utils/dateTimeFormat");

exports.getTableException = async (tableId, filters) => {
  try {
    const { date, upcoming } = filters;
    let where = { tableId };

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

    const tableException = await prisma.tableException.findMany({
      where,
      orderBy: { date: "asc" },
    });

    if (!tableException || tableException.length === 0) {
      throw new AppError(
        404,
        "STORE_EXCEPTION_NOT_FOUND",
        "Table exceptions not found for this restaurant"
      );
    }

    return tableException;
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, "DATABASE_ERROR", "Failed to fetch table exception");
  }
};

exports.createTableException = async (tableId, tableExceptionData) => {
  try {
    const tableException = await prisma.tableException.create({
      data: {
        tableId: parseInt(tableId),
        date: tableExceptionData.formattedDate,
        exceptTimeFrom: tableExceptionData.formattedExceptTimeFrom,
        exceptTimeTo: tableExceptionData.formattedExceptTimeTo,
        isClosed: tableExceptionData.isClosed,
        description: tableExceptionData.description,
      },
    });

    return tableException;
  } catch (error) {
    console.error(error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, "DATABASE_ERROR", "Failed to fetch table exception");
  }
};

exports.updateTableException = async (
  tableId,
  exceptionId,
  tableExceptionData
) => {
  try {
    const updateTableException = await prisma.tableException.update({
      where: {
        id: exceptionId,
        tableId: tableId,
      },
      data: {
        date: tableExceptionData.formattedDate,
        exceptTimeFrom: tableExceptionData.formattedExceptTimeFrom,
        exceptTimeTo: tableExceptionData.formattedExceptTimeTo,
        isClosed: tableExceptionData.isClosed,
        description: tableExceptionData.description,
      },
    });

    return updateTableException;

  } catch (error) {
    console.error(error);

    if (error.code === "P2025") {
      // Prisma not found error
      throw new AppError(404, "NOT_FOUND", "Table exception not found");
    }

    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, "DATABASE_ERROR", "Failed to fetch table exception");
  }
};

exports.deleteTableException = async (tableId, exceptionId) => {
  try {
    const deleteTableException = await prisma.tableException.delete({
      where: {
        id: exceptionId,
        tableId: tableId,
      },
    });

    return deleteTableException;
  } catch (error) {
    console.error(error);

    if (error.code === "P2025") {
      // Prisma not found error
      throw new AppError(404, "NOT_FOUND", "Table exception not found");
    }

    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, "DATABASE_ERROR", "Failed to fetch table exception");
  }
};
