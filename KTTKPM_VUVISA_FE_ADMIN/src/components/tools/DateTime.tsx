export const convertArrayToDateInputValue = (dateArray: any): string => {
  // Nếu là undefined hoặc null
  if (!dateArray) {
    return '';
  }

  // Nếu đã là chuỗi ISO
  if (typeof dateArray === 'string' && dateArray.includes('-')) {
    // Nếu đã là định dạng YYYY-MM-DD, trả về luôn
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateArray)) {
      return dateArray;
    }
    
    // Nếu là chuỗi ISO đầy đủ, chuyển đổi sang YYYY-MM-DD
    try {
      const date = new Date(dateArray);
      return date.toISOString().split('T')[0];
    } catch (e) {
      console.error('Invalid date string:', dateArray);
      return '';
    }
  }

  // Nếu là mảng [year, month, day]
  if (Array.isArray(dateArray) && dateArray.length >= 3) {
    try {
      const year = dateArray[0];
      // Tháng trong JavaScript bắt đầu từ 0, nhưng trong định dạng ISO bắt đầu từ 1
      const month = String(dateArray[1]).padStart(2, '0');
      const day = String(dateArray[2]).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (e) {
      console.error('Error converting date array:', dateArray);
      return '';
    }
  }

  console.warn('Unsupported date format:', dateArray);
  return '';
};