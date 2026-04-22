/**
 * Validation utility functions for BCK Manager Backend API
 * All validators throw Error with Vietnamese messages on validation failure
 */

/**
 * Validate that a price value is non-negative
 * @param {number} price - The price value to validate
 * @param {string} fieldName - The name of the field being validated (for logging)
 * @throws {Error} If price is negative
 */
export const validatePrice = (price, fieldName) => {
  if (price < 0) {
    throw new Error('Giá trị không hợp lệ, không được âm');
  }
};

/**
 * Validate that VAT percentage is within valid range (0-100)
 * @param {number} vat - The VAT percentage to validate
 * @throws {Error} If VAT is not between 0 and 100
 */
export const validateVAT = (vat) => {
  if (vat < 0 || vat > 100) {
    throw new Error('VAT phải từ 0-100%');
  }
};

/**
 * Validate that new utility reading is greater than or equal to old reading
 * @param {number} oldValue - The previous meter reading
 * @param {number} newValue - The new meter reading
 * @throws {Error} If new reading is less than old reading
 */
export const validateUtilityReading = (oldValue, newValue) => {
  if (newValue < oldValue) {
    throw new Error('Chỉ số mới phải lớn hơn hoặc bằng chỉ số cũ');
  }
};

/**
 * Validate that the specified month/year is not in the future
 * @param {number} month - The month (1-12)
 * @param {number} year - The year (e.g., 2024)
 * @throws {Error} If the specified month/year is in the future
 */
export const validateNotFutureDate = (month, year) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed
  
  if (year > currentYear || (year === currentYear && month > currentMonth)) {
    throw new Error('Không thể ghi chỉ số cho tháng tương lai');
  }
};

/**
 * Validate that a date is not in the past
 * @param {string|Date} date - The date to validate (ISO string or Date object)
 * @throws {Error} If the date is in the past
 */
export const validateNotPastDate = (date) => {
  const inputDate = new Date(date);
  const today = new Date();
  
  // Set time to start of day for fair comparison
  today.setHours(0, 0, 0, 0);
  inputDate.setHours(0, 0, 0, 0);
  
  if (inputDate < today) {
    throw new Error('Ngày bắt đầu không được trong quá khứ');
  }
};
