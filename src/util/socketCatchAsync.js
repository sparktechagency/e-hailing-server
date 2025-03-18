const { default: status } = require("http-status");
const deleteUploadedFiles = require("./deleteUploadedFiles");
const emitError = require("../socket/emitError");

const socketCatchAsync = (fn) => {
  return async (socket, io, payload) => {
    try {
      return await fn(socket, io, payload);
    } catch (error) {
      console.log("Socket error:", error);

      // cleanup any uploaded files in case of error
      if (payload && payload.uploadedFiles)
        deleteUploadedFiles(payload.uploadedFiles);

      emitError(
        socket,
        status.INTERNAL_SERVER_ERROR,
        error.message,
        "disconnect"
      );
    }
  };
};

module.exports = socketCatchAsync;
