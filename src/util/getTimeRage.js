const { default: status } = require("http-status");
const ApiError = require("../error/ApiError");

const getTimeRange = (filter) => {
  const now = new Date();
  let startDate = null;

  const allowedFilters = [
    "today",
    "last-7-days",
    "this-month",
    "this-year",
    "all-time",
  ];

  if (!allowedFilters.includes(filter)) {
    throw new ApiError(
      status.BAD_REQUEST,
      `Invalid filter. Allowed values: ${allowedFilters.join(", ")}`
    );
  }

  switch (filter) {
    case "today":
      startDate = new Date(now.setHours(0, 0, 0, 0));
      break;
    case "last-7-days":
      startDate = new Date(now.setDate(now.getDate() - 6));
      break;
    case "this-month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "this-year":
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    case "all-time":
      return {}; // No filter for all time
  }

  return { $gte: startDate };
};

module.exports = getTimeRange;
