const unlinkFile = require("./unlinkFile");

/**
 * Flexible utility to update file array fields with partial delete + new uploads.
 *
 * @param {Array} oldFiles - Existing file URLs (e.g., car.car_image).
 * @param {Array} deleteIndexes - Indexes of files to delete from oldFiles.
 * @param {Array} newFiles - Array of multer file objects to add (optional).
 * @returns {Array} Updated file array (URLs).
 */
const updateFileArrayField = (
  oldFiles = [],
  deleteIndexes = [],
  newFiles = []
) => {
  // Step 1: Clone old files
  let finalFiles = [...oldFiles];

  // Step 2: Sort & delete specified indexes (reverse to avoid index shift)
  deleteIndexes.sort((a, b) => b - a);
  for (const index of deleteIndexes) {
    const [removed] = finalFiles.splice(index, 1);
    if (removed) unlinkFile(removed); // delete old file from disk
  }

  // Step 3: Add new files (paths)
  const newPaths = newFiles.map((file) => file.path);
  finalFiles.push(...newPaths);

  return finalFiles;
};

module.exports = updateFileArrayField;
