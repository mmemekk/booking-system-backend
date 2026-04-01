const { AppError } = require("../middleware/errorHandler");

/**
 * Thai mobile → E.164, e.g. 0819140199 → +66819140199
 */
exports.normalizeThaiPhoneToE164 = (phone) => {
  if (phone == null || String(phone).trim() === "") {
    throw new AppError(400, "INVALID_PHONE", "Phone number is required");
  }

  const raw = String(phone).trim();
  const noSpaces = raw.replace(/[\s\-().]/g, "");

  if (noSpaces.startsWith("+")) {
    const digits = noSpaces.slice(1).replace(/\D/g, "");
    if (digits.length < 9) {
      throw new AppError(400, "INVALID_PHONE", "Invalid phone number");
    }
    return `+${digits}`;
  }

  const digits = noSpaces.replace(/\D/g, "");

  if (digits.startsWith("66") && digits.length >= 11) {
    return `+${digits}`;
  }

  if (digits.startsWith("0") && digits.length === 10) {
    return `+66${digits.slice(1)}`;
  }

  if (digits.length === 9 && /^[6-9]/.test(digits)) {
    return `+66${digits}`;
  }

  throw new AppError(
    400,
    "INVALID_PHONE",
    "Use a Thai mobile number (e.g. 0812345678)"
  );
};
