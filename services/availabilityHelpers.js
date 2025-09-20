const { PrismaClient } = require("@prisma/client");
const { AppError } = require("../middleware/errorHandler");
const prisma = new PrismaClient();

const getStoreHourByDate = async(restaurantId, date) => {
    try {
        const dayOfWeek = date.toLocaleString("en-US", { weekday: "long" }).toLowerCase();
        const storeHour = await prisma.storeHour.findUnique({
            where: { 
                restaurantId_dayOfWeek: { 
                    restaurantId, 
                    dayOfWeek 
                } 
            }
        });

        return storeHour;

    } catch (error) {
        console.error(error);
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(500, "DATABASE_ERROR", "Failed to fetch store hours");
    }
}

const getStoreExceptionByDate = async(restaurantId, date) => {
    try {
        const storeException = await prisma.storeException.findMany({
            where: { 
                restaurantId, 
                date 
            } 
        });

        return storeException;

    } catch (error) {
        console.error(error);
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(500, "DATABASE_ERROR", "Failed to fetch store exceptions");
    }
}

const getTableAvailabilityAndExceptionByDate = async(restaurantId, date) => {
    try {
        const dayOfWeek = date.toLocaleString("en-US", { weekday: "long" }).toLowerCase();
    const tableAvailabilityAndException = await prisma.table.findMany({
      where: { restaurantId },
      select: {
        restaurantId: true,
        id: true,
        name: true,
        capacity: true,
        description: true,
        //availabilities
        availabilities: {
          where: { dayOfWeek },
          select: {
            dayOfWeek: true,
            openTime: true,
            closeTime: true,
          },
        },
        //exceptions
        exceptions: {
          where: { date },
          select: {
            date: true,
            exceptTimeFrom: true,
            exceptTimeTo: true,
            isClosed: true,
            description: true,
          },
        },
      },
    });

        return tableAvailabilityAndException;

    } catch (error) {
        console.error(error);
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(500, "DATABASE_ERROR", "Failed to fetch store hours");
    }
}

const subtractTableExceptionFromAvailabilities = (availabilities, exFrom, exTo) =>{
    const result = [];

    for (const { openTime, closeTime } of availabilities) {
      const start = new Date(openTime).getTime();
      const end = new Date(closeTime).getTime();
      const exStart = new Date(exFrom).getTime();
      const exEnd = new Date(exTo).getTime();

      // No overlap
      if (exEnd <= start || exStart >= end) {
        result.push({ openTime, closeTime });
      }
      // Exception covers everything -> nothing left
      else if (exStart <= start && exEnd >= end) {
        continue;
      }
      // Exception overlaps left side
      else if (exStart <= start && exEnd < end) {
        result.push({ openTime: new Date(exEnd), closeTime: new Date(end) });
      }
      // Exception overlaps right side
      else if (exStart > start && exEnd >= end) {
        result.push({ openTime: new Date(start), closeTime: new Date(exStart) });
      }
      // Exception is in the middle, split interval
      else if (exStart > start && exEnd < end) {
        result.push({ openTime: new Date(start), closeTime: new Date(exStart) });
        result.push({ openTime: new Date(exEnd), closeTime: new Date(end) });
      }
    }

    // Merge contiguous intervals
    if (result.length <= 1) return result;

    result.sort((a, b) => new Date(a.openTime) - new Date(b.openTime));
    const merged = [result[0]];

    for (let i = 1; i < result.length; i++) {
      const last = merged[merged.length - 1];
      if (new Date(result[i].openTime) <= new Date(last.closeTime)) {
        last.closeTime = new Date(Math.max(new Date(last.closeTime), new Date(result[i].closeTime)));
      } else {
        merged.push(result[i]);
      }
    }

    return merged;
}

const formatTableAvailabilityAfterExceptionResponse = (tables) => {
  return tables.map(table => {
    return {
      restaurantId: table.restaurantId,
      id: table.id,
      name: table.name,
      capacity: table.capacity,
      description: table.description,
      availabilities: table.calculatedAvailabilities.map(a => ({
        openTime: a.openTime,
        closeTime: a.closeTime
      }))
    };
  });
}


exports.getStoreHourAfterException = async (restaurantId, date) => {
    const storeHour = await getStoreHourByDate(restaurantId, date);
    const storeExceptions = await getStoreExceptionByDate(restaurantId, date);

    console.log("Store Hour:", storeHour);
    console.log("Store Exceptions:", storeExceptions);

    const baseResponse = {restaurantId, date};
    //check if storeException has isClosed true
    if (storeExceptions.some((ex) => ex.isClosed)) {
        return { ...baseResponse, isClosed: true, openCloseTimes: [] };
    }


    let exceptions = storeExceptions
        .filter((ex) => ex.openTime && ex.closeTime && !ex.isClosed)
        .map((ex) => ({
        openTime: ex.openTime,
        closeTime: ex.closeTime,
        }));

    if (exceptions.length > 0) {
        exceptions.sort((a, b) => a.openTime - b.openTime);

        let merged = [];
        let current = exceptions[0];
        for (let i = 1; i < exceptions.length; i++) {
            if (exceptions[i].openTime <= current.closeTime) {
        // overlap or touching → extend
                current.closeTime =
                exceptions[i].closeTime > current.closeTime
                ? exceptions[i].closeTime
                : current.closeTime;
            } else {
                merged.push(current);
                current = exceptions[i];
            }
        }
        merged.push(current);

        return { ...baseResponse, isClosed: false, openCloseTimes: merged };
    }

    if (!storeHour || storeHour.isClosed) {
        return { ...baseResponse, isClosed: true, date:date, openCloseTimes: [] };
    }

    return {
        ...baseResponse,
        isClosed: false,
        openCloseTimes: [
            {
                openTime: storeHour.openTime,
                closeTime: storeHour.closeTime,
            },
        ],
    };
};


exports.getTableAvailabilityAfterException = async (restaurantId, date) => {
  const tableAvailabilityAndException = await getTableAvailabilityAndExceptionByDate(restaurantId, date);
  console.log("Table Availability and Exceptions:", JSON.stringify(tableAvailabilityAndException, null, 2));

  const result = [];

  for (const table of tableAvailabilityAndException) {
    // If any exception says isClosed => skip this table
    if (table.exceptions.some((ex) => ex.isClosed)) continue;

    let currentAvailabilities = table.availabilities.map((a) => ({
      openTime: a.openTime,
      closeTime: a.closeTime,
    }));

    for (const ex of table.exceptions) {
      currentAvailabilities = subtractTableExceptionFromAvailabilities(currentAvailabilities, ex.exceptTimeFrom, ex.exceptTimeTo);
    }

    if (currentAvailabilities.length > 0) { //make sure that not push the empty availability
      result.push({
        ...table,
        calculatedAvailabilities: currentAvailabilities,
      });
    }
  }

  const formattedTableAvailabilityAfterException = formatTableAvailabilityAfterExceptionResponse(result);
  console.log("Formatted Table Availability After Exceptions:", JSON.stringify(formattedTableAvailabilityAfterException, null, 2));
  return formattedTableAvailabilityAfterException;
};











