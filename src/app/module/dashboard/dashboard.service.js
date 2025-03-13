const { default: status } = require("http-status");
const { EnumUserRole } = require("../../../util/enum");
const Auth = require("../auth/Auth");
const User = require("../user/User");
const EmailHelpers = require("../../../util/emailHelpers");
const validateFields = require("../../../util/validateFields");

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
  const [totalAuth, totalUser] = await Promise.all([
    Auth.countDocuments(),
    User.countDocuments(),
    Services.countDocuments(),
  ]);

  return {
    totalAuth,
    totalUser,
  };
};

// driver management

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
    phoneNumber: payload.phoneNumber,
    address: payload.address,
    idOrPassportNo: payload.idOrPassportNo,
    drivingLicenseNo: payload.drivingLicenseNo,
    licenseType: payload.licenseType,
    licenseExpiry: payload.licenseExpiry,
    profile_image: files.profile_image[0].path,
    id_or_passport_image: files.id_or_passport_image[0].path,
    psv_license_image: files.psv_license_image[0].path,
    driving_license_image: files.driving_license_image[0].path,
  };

  const driver = await User.create(driverData);

  EmailHelpers.sendAddDriverTemp(payload.email, {
    password: payload.password,
    ...driver.toObject(),
  });

  return driver;
};

const editDriver = async (req) => {
  const { body: payload, files, user: userData } = req;

  validateFields(payload, ["authId", "userId"]);

  const { workingDay, ...others } = payload || {};

  if (payload.email || payload.password)
    throw new ApiError(status.BAD_REQUEST, "Email & Password can't be changed");

  const updateData = {
    ...(workingDay && {
      workingDay: convertToArray(payload.workingDay),
    }),
    ...others,
  };

  const employee = await User.findOne({
    _id: payload.userId,
    authId: payload.authId,
  });

  if (!employee) throw new ApiError(status.BAD_REQUEST, "Employee not found.");

  if (files && files.profile_image)
    updateData.profile_image = files.profile_image[0].path;

  const [auth, updatedEmployee] = await Promise.all([
    Auth.findByIdAndUpdate(
      payload.authId,
      { firstName: updateData.firstName, lastName: updateData.lastName },
      {
        new: true,
      }
    ).lean(),
    User.findByIdAndUpdate(
      payload.userId,
      { ...updateData },
      {
        new: true,
      }
    ).lean(),
  ]);

  return {
    updatedEmployee,
  };
};

const deleteDriver = async (userData, payload) => {
  validateFields(payload, ["userId", "authId"]);

  const deletedUser = await User.deleteOne({
    _id: payload.userId,
    employer: userData.userId,
  });

  if (!deletedUser.deletedCount)
    throw new ApiError(status.NOT_FOUND, "Employee Not found");

  const deletedAuth = await Auth.deleteOne({ _id: payload.authId });
};

const DashboardService = {
  revenue,
  totalOverview,
  postDriver,
  editDriver,
  deleteDriver,
};

module.exports = DashboardService;
