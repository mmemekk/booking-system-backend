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

exports.getStoreHourAfterException = async (restaurantId, date) => {
    const storeHour = await getStoreHourByDate(restaurantId, date);
    const storeExceptions = await getStoreExceptionByDate(restaurantId, date);

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
    return await getTableAvailabilityAndExceptionByDate(restaurantId, date);
};

// 2️⃣ Fetch tables with availability, exceptions, and reservations
exports.getTablesWithDetails = async (restaurantId, dayOfWeek, date, partySize) => {
  return await prisma.table.findMany({
    where: {
      restaurantId,
      capacity: { gte: partySize }
    },
    include: {
      availabilities: { where: { dayOfWeek } },
      exceptions: { where: { date } },
      reservations: { where: { bookingDate: date } }
    }
  });
}

// 3️⃣ Generate table slots excluding reservations
exports.generateSlotsForTable = async (table, slotDuration, restaurantOpen, restaurantClose) => {
  if (table.exceptions.some(e => e.isClosed)) return [];

  let tableOpen = table.availabilities[0]?.openTime ?? restaurantOpen;
  let tableClose = table.availabilities[0]?.closeTime ?? restaurantClose;

  const exception = table.exceptions[0];
  if (exception) {
    if (exception.exceptTimeFrom) tableOpen = exception.exceptTimeFrom;
    if (exception.exceptTimeTo) tableClose = exception.exceptTimeTo;
  }

  return generateSlots(tableOpen, tableClose, slotDuration, table.reservations);
}

// Helper: generate slots avoiding reservation conflicts
exports.generateSlots = (openTime, closeTime, slotDuration, reservations) => {
  const slots = [];
  let current = new Date(openTime);

  while (current < closeTime) {
    const end = new Date(current.getTime() + slotDuration * 60000);
    const conflict = reservations.some(r => !(end <= r.startTime || current >= r.endTime));

    if (!conflict && end <= closeTime) {
      slots.push({
        startTime: current.toTimeString().slice(0, 5),
        endTime: end.toTimeString().slice(0, 5)
      });
    }
    current = end;
  }

  return slots;
}

// 4️⃣ Map all table slots to time-first structure
exports.mapSlotsByTime = (tables, slotDuration, restaurantOpen, restaurantClose) =>{
  const allSlots = {};

  for (const table of tables) {
    const tableSlots = generateSlotsForTable(table, slotDuration, restaurantOpen, restaurantClose);

    tableSlots.forEach(slot => {
      const key = `${slot.startTime}-${slot.endTime}`;
      if (!allSlots[key]) allSlots[key] = [];
      allSlots[key].push({
        tableId: table.id,
        name: table.name,
        capacity: table.capacity,
        description: table.description
      });
    });
  }

  return Object.entries(allSlots).map(([key, tables]) => {
    const [startTime, endTime] = key.split("-");
    return { startTime, endTime, tables };
  });
}

