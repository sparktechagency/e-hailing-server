const { default: status } = require("http-status");
const { EnumUserRole, UserAccountStatus } = require("../../../util/enum");
const Auth = require("../auth/Auth");
const User = require("../user/User");
const EmailHelpers = require("../../../util/emailHelpers");
const validateFields = require("../../../util/validateFields");
const ApiError = require("../../../error/ApiError");
const unlinkFile = require("../../../util/unlinkFile");
const QueryBuilder = require("../../../builder/queryBuilder");
const Car = require("../car/Car");
const Admin = require("../admin/Admin");

// overview ========================

const revenue = async (query) => {
  const { year: strYear } = query;
  const year = Number(strYear);

  if (!year) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Missing year");
  }

  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year + 1, 0, 1);

  const distinctYears = await Transaction.aggregate([
    {
      $group: {
        _id: { $year: "$createdAt" },
      },
    },
    {
      $sort: { _id: -1 },
    },
    {
      $project: {
        year: "$_id",
        _id: 0,
      },
    },
  ]);

  const totalYears = distinctYears.map((item) => item.year);

  const revenue = await Subscription.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lt: endDate,
        },
        // paymentStatus: "succeeded", // Only include successful payments
      },
    },
    {
      $project: {
        price: 1, // Only keep the price field
        month: { $month: "$createdAt" }, // Extract the month from createdAt
      },
    },
    {
      $group: {
        _id: "$month", // Group by the month
        totalRevenue: { $sum: "$price" }, // Sum up the price for each month
      },
    },
    {
      $sort: { _id: 1 }, // Sort the result by month (ascending)
    },
  ]);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const monthlyRevenue = monthNames.reduce((acc, month) => {
    acc[month] = 0;
    return acc;
  }, {});

  revenue.forEach((r) => {
    const monthName = monthNames[r._id - 1];
    monthlyRevenue[monthName] = r.totalRevenue;
  });

  return {
    total_years: totalYears,
    monthlyRevenue,
  };
};

const totalOverview = async () => {
  const [
    totalDriver,
    onlineDriver,
    totalUser,
    onlineUser,
    totalAdmin,
    totalAuth,
    totalCars,
  ] = await Promise.all([
    User.countDocuments({ role: EnumUserRole.DRIVER }),
    User.countDocuments({ role: EnumUserRole.DRIVER, isOnline: true }),
    User.countDocuments({ role: EnumUserRole.USER }),
    User.countDocuments({ role: EnumUserRole.USER, isOnline: true }),
    Admin.countDocuments(),
    Auth.countDocuments(),
    Car.countDocuments(),
  ]);

  return {
    totalDriver,
    onlineDriver,
    totalUser,
    onlineUser,
    totalAdmin,
    totalAuth,
    totalCars,
  };
};

const growth = async (query) => {
  const { year: yearStr, role } = query;

  validateFields(query, ["role", "year"]);

  const year = Number(yearStr);
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year + 1, 0, 1);

  const months = Array.from({ length: 12 }, (_, i) =>
    new Date(0, i).toLocaleString("en", { month: "long" })
  );

  // Aggregate monthly registration counts and list of all years
  const [monthlyRegistration, distinctYears] = await Promise.all([
    Auth.aggregate([
      {
        $match: {
          role: role,
          createdAt: {
            $gte: startOfYear,
            $lt: endOfYear,
          },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          month: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]),
    Auth.aggregate([
      {
        $match: {
          role: role,
        },
      },
      {
        $group: {
          _id: { $year: "$createdAt" },
        },
      },
      {
        $project: {
          year: "$_id",
          _id: 0,
        },
      },
      {
        $sort: {
          year: 1,
        },
      },
    ]),
  ]);

  const total_years = distinctYears.map((item) => item.year);

  // Initialize result object with all months set to 0
  const result = months.reduce((acc, month) => ({ ...acc, [month]: 0 }), {});

  // Populate result with actual registration counts
  monthlyRegistration.forEach(({ month, count }) => {
    result[months[month - 1]] = count;
  });

  return {
    total_years,
    monthlyRegistration: result,
  };
};

// driver management ========================

const postDriver = async (req) => {
  const { body: payload, files, user } = req;

  validateFields(files, [
    "profile_image",
    "id_or_passport_image",
    "psv_license_image",
    "driving_license_image",
  ]);
  validateFields(payload, [
    "name",
    "email",
    "password",
    "phoneNumber",
    "address",
    "idOrPassportNo",
    "drivingLicenseNo",
    "licenseType",
    "licenseExpiry",
  ]);

  const authData = {
    name: payload.name,
    email: payload.email,
    password: payload.password,
    role: EnumUserRole.DRIVER,
    isActive: true,
  };

  const auth = await Auth.create(authData);

  const driverData = {
    authId: auth._id,
    name: payload.name,
    email: payload.email,
    password: payload.password,
    role: EnumUserRole.DRIVER,
    phoneNumber: payload.phoneNumber,
    address: payload.address,
    isAvailable: true,
    idOrPassportNo: payload.idOrPassportNo,
    drivingLicenseNo: payload.drivingLicenseNo,
    licenseType: payload.licenseType,
    licenseExpiry: payload.licenseExpiry,
    profile_image: files.profile_image[0].path,
    id_or_passport_image: files.id_or_passport_image[0].path,
    psv_license_image: files.psv_license_image[0].path,
    driving_license_image: files.driving_license_image[0].path,
    userAccountStatus: UserAccountStatus.VERIFIED,
  };

  const driver = await User.create(driverData);

  EmailHelpers.sendAddDriverTemp(payload.email, {
    password: payload.password,
    ...driver.toObject(),
  });

  return driver;
};

const getDriver = async (query) => {
  validateFields(query, ["driverId"]);

  const driver = await User.findById(query.driverId)
    .populate("assignedCar")
    .lean();
  if (!driver) throw new ApiError(status.NOT_FOUND, "Driver not found");

  return driver;
};

const getAllDriversOrUsers = async (query) => {
  validateFields(query, ["role"]);

  if (!Object.values(EnumUserRole).includes(query.role))
    throw new ApiError(status.BAD_REQUEST, "Invalid role");

  const driversQuery = new QueryBuilder(
    User.find({ role: query.role }).lean(),
    query
  )
    .search(["name", "email", "phoneNumber"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const [result, meta] = await Promise.all([
    driversQuery.modelQuery,
    driversQuery.countTotal(),
  ]);

  return {
    meta,
    result,
  };
};

const editDriver = async (req) => {
  validateFields(req.body, ["authId", "userId"]);

  const { body, files = {} } = req;
  const { email, password, name, userId, authId, ...otherFields } = body || {};

  if (email || password)
    throw new ApiError(status.BAD_REQUEST, "Email & Password can't be changed");

  const driver = await User.findOne({
    _id: body.userId,
    authId: body.authId,
  });

  if (!driver) throw new ApiError(status.BAD_REQUEST, "Driver not found.");

  const updateData = { name, ...otherFields };

  const fileFields = [
    { key: "profile_image", oldPath: driver.profile_image },
    { key: "id_or_passport_image", oldPath: driver.id_or_passport_image },
    { key: "psv_license_image", oldPath: driver.psv_license_image },
    { key: "driving_license_image", oldPath: driver.driving_license_image },
  ];

  for (const { key, oldPath } of fileFields) {
    if (files[key]) {
      updateData[key] = files[key][0].path;
      unlinkFile(oldPath);
    }
  }

  const [updatedDriver] = await Promise.all([
    User.findByIdAndUpdate(userId, updateData, { new: true }).lean(),

    Auth.findByIdAndUpdate(authId, { name }, { new: true }).lean(),
  ]);

  return updatedDriver;
};

const DashboardService = {
  revenue,
  totalOverview,
  growth,
  postDriver,
  getDriver,
  getAllDriversOrUsers,
  editDriver,
};

module.exports = DashboardService;
