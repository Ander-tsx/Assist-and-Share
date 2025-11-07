import { User } from "../../models/user.model.js";
import { ApiError } from "../../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../utils/mailer.js";

export const AuthService = {
    register: async (userData) => {
        try {
            const { email, password, first_name, last_name, role, speciality } = userData;

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                throw ApiError.badRequest("El correo ya está registrado");
            }

            const newUser = new User({
                email,
                password,
                first_name,
                last_name,
                role,
                speciality,
            });
            await newUser.save();

            const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
                expiresIn: "30d",
            });

            const userObj = newUser.toObject();
            delete userObj.password;

            return {
                user: userObj,
                token,
            };
        } catch (error) {
            if (error instanceof ApiError) throw error;

            console.error("Error en AuthService.register:", error);
            throw ApiError.internal("Error al registrar el usuario");
        }
    },

    forgotPassword: async (email) => {
        try {

            const user = await User.findOne({ email });
            if (!user) {
                throw ApiError.notFound("Usuario no encontrado");
            }
            
            const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
                expiresIn: "1h",
            });
            
            const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
            await sendEmail({
                to: email,
                subject: "Restablecimiento de contraseña",
                text: `Haz clic en el siguiente enlace para restablecer tu contraseña: ${resetLink}`,
            });
            
            return { message: "Correo de restablecimiento de contraseña enviado" };
        } catch (error) {
            if (error instanceof ApiError) throw error;

            console.error("Error en AuthService.forgotPassword:", error);
            throw ApiError.internal("Error al procesar la solicitud de restablecimiento de contraseña");
        }
    },

    resetPassword: async (token, newPassword) => {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);
            if (!user) {
                throw ApiError.notFound("Usuario no encontrado");
            }

            user.password = newPassword;
            await user.save();

            return { message: "Contraseña restablecida con éxito" };
        } catch (error) {
            if (error instanceof ApiError) throw error;

            console.error("Error en AuthService.resetPassword:", error);
            throw ApiError.internal("Error al restablecer la contraseña");
        }
    },
};
