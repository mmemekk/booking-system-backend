require("dotenv").config();
const twilio = require("twilio");
const dateTimeFormat = require("../utils/dateTimeFormat");
const { normalizeThaiPhoneToE164 } = require("../utils/phone");

/** SMS only: e.g. 07 Dec 2026 */
function formatDateForSms(date) {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = months[d.getUTCMonth()];
  const year = d.getUTCFullYear();
  return `${day} ${month} ${year}`;
}

function getTwilioClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) {
    return null;
  }
  // return twilio(sid, token);
  return null;
}

async function sendSMS(to, messageBody) {
  try {
    const client = getTwilioClient();
    if (!client) {
      console.warn("SMS skipped: Twilio credentials not configured");
      return null;
    }
    if (!process.env.TWILIO_PHONE_NUMBER) {
      console.warn("SMS skipped: TWILIO_PHONE_NUMBER not set");
      return null;
    }

    const message = await client.messages.create({
      body: messageBody,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });

    console.log(`✅ Success! SMS sent to ${to}. Message SID: ${message.sid}`);
    return message;
  } catch (error) {
    console.error(`❌ Error sending SMS to ${to}:`, error.message);
    throw error;
  }
}

async function sendBookingConfirmationSms({
  customerPhone,
  bookingRef,
  customerName,
  restaurantName,
  bookingDate,
  startTime,
  capacity,
}) {
  const dateStr = formatDateForSms(bookingDate);
  const startStr = dateTimeFormat.formatTimeForResponse(startTime);
  const to = normalizeThaiPhoneToE164(customerPhone);
  const body = [
    `✅ Your booking with ${restaurantName} is Confirmed!`,
    `Booking Ref: ${bookingRef}`,
    `Name: ${customerName}`,
    `Date: ${dateStr}`,
    `Time: ${startStr}`,
    `Guests: ${capacity} people`,
    `To modify your booking, tap here: https://genie.up.railway.app/manage/${bookingRef}`,
    "See you soon!😃",
  ].join("\n");

  return sendSMS(to, body);
}

async function sendBookingUpdateSms({
  customerPhone,
  bookingRef,
  customerName,
  restaurantName,
  bookingDate,
  startTime,
  capacity,
  isUpdated = false,
  isCanceled = false,
}) {
  const dateStr = formatDateForSms(bookingDate);
  const startStr = dateTimeFormat.formatTimeForResponse(startTime);
  const to = normalizeThaiPhoneToE164(customerPhone);

  let title;
  let end;
  if (isCanceled) {
    title = `❌ Your booking with ${restaurantName} is Canceled!`;
    end = "Hope to see you another time!😔";
  } else if (isUpdated) {
    title = `🔄 Your booking with ${restaurantName} is Updated!`;
    end = "See you soon!😃";
  } else {
    title = `✅ Your booking with ${restaurantName} is Confirmed!`;
    end = "See you soon!😃";
  }

  const body = [
    title,
    `Booking Ref: ${bookingRef}`,
    `Name: ${customerName}`,
    `Date: ${dateStr}`,
    `Time: ${startStr}`,
    `Guests: ${capacity} people`,
    `To modify your booking, tap here: https://genie.up.railway.app/manage/${bookingRef}`,
    end,
  ].join("\n");

  return sendSMS(to, body);
}

module.exports = { sendSMS, sendBookingConfirmationSms, sendBookingUpdateSms };
