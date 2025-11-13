import { ApiError } from "./ApiError.js";

export const handleMongooseError = (error, customMessage = "Error en base de datos") => {
    if (error.code === 11000) {
        const field = Object.keys(error.keyValue || {})[0];
        return ApiError.badRequest(`El valor del campo '${field}' ya está en uso`);
    }

    if (error.name === "ValidationError") {
        const messages = Object.values(error.errors).map((e) => e.message);
        return ApiError.badRequest(messages.join("; "));
    }

    if (error.name === "CastError") {
        return ApiError.badRequest(`El valor del campo '${error.path}' no es válido`);
    }

    if (error instanceof ApiError) {
        return error;
    }

    return ApiError.internal(customMessage);
};
