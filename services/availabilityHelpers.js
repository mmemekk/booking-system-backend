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

const getBookingByDate = async(restaurantId, date) => {
    try {
        const booking = await prisma.booking.findMany({
            where: { 
                restaurantId, 
                bookingDate: date 
            } 
        });

        return booking;

    } catch (error) {
        console.error(error);
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(500, "DATABASE_ERROR", "Failed to fetch bookings");
    }
}

const getSlotDurationForRestaurant = async(restaurantId) => {
    try {
        const restaurant = await prisma.restaurant.findUnique({
            where: { id: restaurantId },
            select: { slotDuration: true }
        });

        return restaurant.slotDuration;

    } catch (error) {
        console.error(error);
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(500, "DATABASE_ERROR", "Failed to fetch restaurant slot duration");
    }
}

const subtractInterval = (availabilities, exFrom, exTo) =>{
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

const intersectIntervals = (availabilities, allowedIntervals) => {
  const result = [];

  for (const a of availabilities) {
    const aStart = new Date(a.openTime).getTime();
    const aEnd = new Date(a.closeTime).getTime();

    for (const allowed of allowedIntervals) {
      const sStart = new Date(allowed.openTime).getTime();
      const sEnd = new Date(allowed.closeTime).getTime();

      const overlapStart = Math.max(aStart, sStart);
      const overlapEnd = Math.min(aEnd, sEnd);

      if (overlapStart < overlapEnd) {
        result.push({
          openTime: new Date(overlapStart),
          closeTime: new Date(overlapEnd),
        });
      }
    }
  }

  // Merge contiguous overlaps (optional, for clean results)
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
};

const generateTimeSlot = (startTime, endTime, slotDurationMs, stepMs) => {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();

    const slots = [];

    for (let t = start; t + slotDurationMs <= end; t += stepMs) {
        slots.push({
            openTime: new Date(t),
            closeTime: new Date(t + slotDurationMs)
        });
    }

    return slots;
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


exports.getTableAvailabilityAfterExceptionAndBooking = async (restaurantId, date) => {
    const tableAvailabilityAndException = await getTableAvailabilityAndExceptionByDate(restaurantId, date);
    console.log("Table Availability and Exceptions:", JSON.stringify(tableAvailabilityAndException, null, 2));
    const booking = await getBookingByDate(restaurantId, date);
    console.log("Bookings", booking);

    const result = [];

    for (const table of tableAvailabilityAndException) {
        // skip closed table
        if (table.exceptions.some((ex) => ex.isClosed)) continue;

        let currentAvailabilities = table.availabilities.map((a) => ({
            openTime: a.openTime,
            closeTime: a.closeTime,
        }));
        
        //subtract exceptions
        for (const ex of table.exceptions) {
            currentAvailabilities = subtractInterval(currentAvailabilities, ex.exceptTimeFrom, ex.exceptTimeTo);
        }

        //subtract bookings
        const bookedTable = booking.filter((b) => b.tableId === table.id);
        for (const res of bookedTable) {
            currentAvailabilities = subtractInterval(currentAvailabilities, res.startTime, res.endTime);
        }

        //make sure that not push the empty availability
        if (currentAvailabilities.length > 0) { 
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

exports.getTableAvailabilityAfterStoreHour = async (storeHourAfterException, tableAvailabilityAfterExceptionAndBooking) => {
    // If store closed -> return empty
    if (!storeHourAfterException || storeHourAfterException.isClosed) {
        return [];
    }

    const storeIntervals = storeHourAfterException.openCloseTimes.map((s) => ({
        openTime: s.openTime,
        closeTime: s.closeTime,
    }));

    const finalResult = [];

    for (const table of tableAvailabilityAfterExceptionAndBooking) {
        const availabilitiesAfterStoreHour = intersectIntervals(table.availabilities, storeIntervals);

        if (availabilitiesAfterStoreHour.length > 0) {
            finalResult.push({
            ...table,
            availabilities: availabilitiesAfterStoreHour,
        });
    }
  }

    return finalResult;
}

exports.generateTimeSlotsForAvailability = async (restaurantId, tableAvailabilities) => {
    const slotDuration = await getSlotDurationForRestaurant(restaurantId);
    const step = 15; // minutes

    const slotDurationMs = slotDuration * 60 * 1000;
    const stepMs = step * 60 * 1000;

    const result = [];

    for (const table of tableAvailabilities){
        const tableSlots = [];

        for (const availability of table.availabilities){
            const slots = generateTimeSlot(availability.openTime, availability.closeTime, slotDurationMs, stepMs);
            tableSlots.push(...slots);
        }

        result.push({
            ...table,
            availabilities: tableSlots,
        });
    }

    return result;
} 

exports.filterAvailability = (availableTables, {time,capacity,capacityBuffer}={} ) => {
    if (!Array.isArray(availableTables)) {
        return [];
    }
      let result = availableTables;

      if (capacity != undefined) {

        if(capacityBuffer != undefined) {
          result = result.filter(table => table.capacity >= capacity && table.capacity <= (capacity+capacityBuffer));
        } else {
          result = result.filter(table => table.capacity >= capacity);
      }
    }

    if (time !== undefined) {
        result = result
            .map(table => ({
                ...table,
                availabilities: table.availabilities.filter(
                    slot => slot.openTime >= time
                )
            }))
            .filter(table => table.availabilities.length > 0);
    }

    return result

}

exports.checkIfRequestedCapacityBelowMaximumCapacity = (availableTables, capacity) => {

    if (!Array.isArray(availableTables)) {
        return [];
    }

  const aggregatedCapacity = new Set();

  availableTables.forEach(table =>{
    aggregatedCapacity.add(table.capacity);
  }
  );

  const maxCapacity = Math.max(...aggregatedCapacity);

  console.log("Aggregated Capacity:", aggregatedCapacity);
  console.log("Max Capacity:", maxCapacity);
  
  return capacity <= maxCapacity;
}


exports.getAggregatedTimeSlots = (availableTables) => {
  const aggregatedTimeSetinMs = new Set();

  availableTables.forEach(table =>{
    table.availabilities.forEach(slot => {
      aggregatedTimeSetinMs.add(slot.openTime.getTime());
    });
  }
  );

  return Array.from(aggregatedTimeSetinMs).sort((a,b) => a - b);

}

exports.assertIsAvailableAtRequestedTime = (aggregatedTimeinMs, requestedTime) => {
  const requestedTimeinMs = new Date(requestedTime).getTime();
  return aggregatedTimeinMs.includes(requestedTimeinMs);
}

exports.convertAlternativeinMsArraytoTimeArray = (alternativesInMs) => {
  return alternativesInMs.map(timeinMs => new Date(timeinMs));
}
exports.getAlternativeTimeSlots = (aggregatedTimeinMs, requestedTime, maxAlternative) => {

  const requestedTimeinMs = new Date(requestedTime).getTime();

  const alternatives = [];

  // Find insertion index (first time >= requestedTime)
  let index = aggregatedTimeinMs.findIndex(
    time => time >= requestedTimeinMs
  );

  if (index === -1) {
    index = aggregatedTimeinMs.length;
  }

  let left = index - 1;
  let right = index;

  while (
    alternatives.length < maxAlternative &&
    (left >= 0 || right < aggregatedTimeinMs.length)
  ) {

    // Take one before
    if (right < aggregatedTimeinMs.length && alternatives.length < maxAlternative) {
      alternatives.push(aggregatedTimeinMs[right]);
      right++;
    }

    // Take one after
    if (left >= 0 && alternatives.length < maxAlternative) {
      alternatives.push(aggregatedTimeinMs[left]);
      left--;
    }

  }

  const sortedAlternatives = alternatives.sort((a, b) => a-b);
  return this.convertAlternativeinMsArraytoTimeArray(sortedAlternatives);
};








