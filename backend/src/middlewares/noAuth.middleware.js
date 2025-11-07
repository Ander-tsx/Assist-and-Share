import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";

export const noAuthMiddleware = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) return next();

    try {
        jwt.verify(token, process.env.JWT_SECRET);
        return ApiError.forbidden(res, "Ya tienes una sesión activa");
    } catch {
        return next();
    }
};
