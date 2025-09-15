const tableExceptionServices = require("../services/tableExceptionServices");
const { AppError } = require("../middleware/errorHandler");
const dateTimeFormat = require("../utils/dateTimeFormat");

exports.getTableException = async (req, res, next) => {
  try {
    const tableId = parseInt(req.params.tableId);

    const { date, upcoming } = req.query;

    const tableException = await tableExceptionServices.getTableException(
      tableId,
      {
        date,
        upcoming,
      }
    );

    const formattedTableException =
      dateTimeFormat.formatDateTimeForTableExceptionResponseArray(
        tableException
      );

    return res.json({ formattedTableException });
  } catch (error) {
    next(error);
  }
};

exports.createTableException = async (req, res, next) => {
  try {
    const tableId = parseInt(req.params.tableId);

    const { date, exceptTimeFrom, exceptTimeTo, isClosed, description } = req.body;

    if (!date || isClosed == undefined) {
      throw new AppError(
        400,
        "MISSING_INPUT_FIELD",
        "Missing required input fields"
      );
    }

    if (!isClosed && (!exceptTimeFrom || !exceptTimeTo)) {
      throw new AppError(
        400,
        "MISSING_TIME",
        "Exception Time are required when store is open"
      );
    }

    const formattedDate = dateTimeFormat.formatDateForDatabase(date);

    let formattedExceptTimeFrom = null;
    let formattedExceptTimeTo = null;

    if (!isClosed) {
      formattedExceptTimeFrom = dateTimeFormat.formatTimeForDatabase(exceptTimeFrom);
      formattedExceptTimeTo = dateTimeFormat.formatTimeForDatabase(exceptTimeTo);
    }

    const createTableException =
      await tableExceptionServices.createTableException(tableId, {
        formattedDate,
        formattedExceptTimeFrom,
        formattedExceptTimeTo,
        isClosed,
        description,
      });
    
    const formattedCreateTableException =
      dateTimeFormat.formatDateTimeForTableExceptionResponse(
        createTableException
      );

    return res.status(201).json({ formattedCreateTableException });
  } catch (error) {
    next(error);
  }
};

exports.updateTableException = async (req, res, next) => {
  try {
    const tableId = parseInt(req.params.tableId);
    const exceptionId = parseInt(req.params.exceptionId);

    if (!exceptionId || isNaN(exceptionId)) {
      throw new AppError(400, "MISSING_ID", "Exception ID is required");
    }

    const { date, exceptTimeFrom, exceptTimeTo, isClosed, description } = req.body;

    const formattedDate = date
      ? dateTimeFormat.formatDateForDatabase(date)
      : undefined;
    const formattedExceptTimeFrom = exceptTimeFrom
      ? dateTimeFormat.formatTimeForDatabase(exceptTimeFrom)
      : undefined;
    const formattedExceptTimeTo = exceptTimeTo
      ? dateTimeFormat.formatTimeForDatabase(exceptTimeTo)
      : undefined;

    const updateTableException = await tableExceptionServices.updateTableException(
        tableId,
        exceptionId,
        {
          formattedDate,
          formattedExceptTimeFrom,
          formattedExceptTimeTo,
          isClosed,
          description,
        }
      );

    const formattedUpdateTableException = dateTimeFormat.formatDateTimeForTableExceptionResponse(updateTableException);

    return res.json({ formattedUpdateTableException });
  } catch (error) {
    next(error);
  }
};

exports.deleteTableException = async (req, res, next) => {
  try {
    const tableId = parseInt(req.params.tableId);
    const exceptionId = parseInt(req.params.exceptionId);

    if (!exceptionId || isNaN(exceptionId)) {
      throw new AppError(400, "MISSING_ID", "Exception ID is required");
    }

    const deleteTableException = await tableExceptionServices.deleteTableException(
        tableId,
        exceptionId
      );

    const formattedDeletedTableException = dateTimeFormat.formatDateTimeForTableExceptionResponse(deleteTableException);

    return res.json({
      message: "Table Exception deleted successfully",
      formattedDeletedTableException,
    });
  } catch (error) {
    next(error);
  }
};
