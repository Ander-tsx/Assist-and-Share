import { ApiError } from "./ApiError.js";
import { ApiResponse } from "./ApiResponse.js";

export const controllerError = (res, error) => {
    if (process.env.DEBUG == "true") {
        console.error("Error en controller:", error);
    }
    if (error instanceof ApiError) {
        return ApiResponse.error(res, {
            message: error.message,
            status: error.status,
        });
    }
    return ApiResponse.error(res, {
        message: "Error interno",
        status: 500,
    });
};
