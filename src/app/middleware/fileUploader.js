const multer = require("multer");
const fs = require("fs");

const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

const isValidFileType = (mimetype) => allowedMimeTypes.includes(mimetype);

const createDirIfNotExists = (uploadPath) => {
  if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
};

const uploadFile = () => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadPath = `uploads/${file.fieldname}`;

      createDirIfNotExists(uploadPath);

      if (isValidFileType(file.mimetype)) {
        cb(null, uploadPath);
      } else {
        cb(new Error("Invalid file type"));
      }
    },
    filename: function (req, file, cb) {
      const name = Date.now() + "-" + file.originalname;

      // Store uploaded file paths in req.uploadedFiles for deletion in case of error or rollback needed
      if (!req.uploadedFiles) req.uploadedFiles = [];
      const filePath = `uploads/${file.fieldname}/${name}`;
      req.uploadedFiles.push(filePath);

      cb(null, name);
    },
  });

  const fileFilter = (req, file, cb) => {
    const allowedFieldNames = [
      "profile_image",
      "id_or_passport_image",
      "psv_license_image",
      "driving_license_image",

      "car_image",
      "car_grant_image",
      "car_insurance_image",
      "e_hailing_car_permit_image",
    ];

    // Allow requests without files (when there's no fieldname)
    if (!file.fieldname) return cb(null, true);

    // Check if the fieldname is valid
    if (!allowedFieldNames.includes(file.fieldname))
      return cb(new Error("Invalid fieldname"));

    // Check if the file type is valid
    if (isValidFileType(file.mimetype)) return cb(null, true);
    else return cb(new Error("Invalid file type"));
  };

  const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
  }).fields([
    { name: "profile_image", maxCount: 1 },
    { name: "id_or_passport_image", maxCount: 1 },
    { name: "psv_license_image", maxCount: 1 },
    { name: "driving_license_image", maxCount: 1 },

    { name: "car_image", maxCount: 5 },
    { name: "car_grant_image", maxCount: 1 },
    { name: "car_insurance_image", maxCount: 1 },
    { name: "e_hailing_car_permit_image", maxCount: 1 },
  ]);

  return upload;
};

module.exports = { uploadFile };
