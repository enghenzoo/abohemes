function getLastMonthRange() {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth(), 0); // Last day of the previous month

  const formatDate = (date) => {
    return `${date.getFullYear()}-${("0" + (date.getMonth() + 1)).slice(-2)}-${(
      "0" + date.getDate()
    ).slice(-2)} ${("0" + date.getHours()).slice(-2)}:${(
      "0" + date.getMinutes()
    ).slice(-2)}:${("0" + date.getSeconds()).slice(-2)}`;
  };

  return {
    firstDay: formatDate(firstDay),
    lastDay: formatDate(lastDay),
  };
}

function getFirstDayOfCurrentMonth() {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth());

  return `${now.getFullYear()}-${("0" + (firstDay.getMonth() + 1)).slice(
    -2
  )}-${("0" + firstDay.getDate()).slice(-2)} 00:00:00`;
}

function getCurrentDay() {
  const now = new Date();

  return `${now.getFullYear()}-${("0" + (now.getMonth() + 1)).slice(-2)}-${(
    "0" + now.getDate()
  ).slice(-2)} ${("0" + now.getHours()).slice(-2)}:${(
    "0" + now.getMinutes()
  ).slice(-2)}:${("0" + now.getSeconds()).slice(-2)}`;
}

module.exports = {
  getLastMonthRange,
  getFirstDayOfCurrentMonth,
  getCurrentDay,
};
