import { ApiResponse } from "./ApiResponse.js";
import { handleMongooseError } from "./handleMongooseError.js";

export const controllerError = (res, error, customMessage = "Error interno") => {
    if (process.env.DEBUG === "true") {
        console.error("Error en controller:", error);
    }

    const parsedError = handleMongooseError(error, customMessage);

    return ApiResponse.error(res, {
        message: parsedError.message,
        status: parsedError.status,
        code: parsedError.code,
    });
};