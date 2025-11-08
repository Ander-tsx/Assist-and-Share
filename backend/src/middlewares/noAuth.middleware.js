import jwt from "jsonwebtoken";
import { ApiResponse } from "../utils/ApiResponse.js";

export const noAuthMiddleware = ({ setSession = false } = {}) => (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (setSession) {
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                req.session = { user: { id: decoded.id, role: decoded.role } };
            } catch (err) {
                console.log("Token inválido o expirado, se permite acceso sin sesión");
            }
        }
        return next();
    }

    if (!token) return next();

    try {
        jwt.verify(token, process.env.JWT_SECRET);
        return ApiResponse.error(res, {
            message: "Ya estás autenticado",
            status: 400,
        });
    } catch {
        return next();
    }
};
