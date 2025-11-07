import { AuthService } from "./auth.service.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import passport from "passport";
import jwt from "jsonwebtoken";

export const AuthController = {
    login: async (req, res, next) => {
        passport.authenticate("local", { session: false }, (err, user, info) => {
            if (err) return next(err);
            if (!user) {
                return ApiResponse.error(res, {
                    message: info.message || "Error de autenticación",
                    status: 401,
                });
            }

            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
                expiresIn: "30d",
            });

            const userData = user.toObject();
            delete userData.password;

            return ApiResponse.success(res, {
                message: "Inicio de sesión exitoso",
                value: { user: userData, token },
            });
        })(req, res, next);
    },

    register: async (req, res) => {
        const { email, password, first_name, last_name, role, speciality } = req.body;

        try {
            const data = await AuthService.register({
                email,
                password,
                first_name,
                last_name,
                role,
                speciality,
            });

            return ApiResponse.success(res, {
                message: "Usuario registrado correctamente",
                value: data,
                status: 201,
            });
        } catch (error) {
            return ApiResponse.error(res, {
                message: "Error al registrar usuario",
                error,
                status: 400,
            });
        }
    },

    googleCallback: (req, res) => {
        const user = req.user;
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "30d",
        });

        return ApiResponse.success(res, {
            message: "Inicio de sesión con Google exitoso",
            value: { user, token },
        });
    }
};
