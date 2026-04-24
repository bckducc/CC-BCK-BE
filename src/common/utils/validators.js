export const validatePrice = (price) => {
  if (price < 0) {
    throw new Error('Giá trị không hợp lệ, không được âm');
  }
};

export const validateVAT = (vat) => {
  if (vat < 0 || vat > 100) {
    throw new Error('VAT phải từ 0-100%');
  }
};

export const validateUtilityReading = (oldValue, newValue) => {
  if (newValue < oldValue) {
    throw new Error('Chỉ số mới phải lớn hơn hoặc bằng chỉ số cũ');
  }
};

export const validateNotFutureDate = (month, year) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (year > currentYear || (year === currentYear && month > currentMonth)) {
    throw new Error('Không thể ghi chỉ số cho tháng tương lai');
  }
};

export const validateNotPastDate = (date) => {
  const inputDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  inputDate.setHours(0, 0, 0, 0);

  if (inputDate < today) {
    throw new Error('Ngày bắt đầu không được trong quá khứ');
  }
};
