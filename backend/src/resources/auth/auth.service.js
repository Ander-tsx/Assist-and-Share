import { User } from "../../models/user.model.js";
import { ApiError } from "../../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../utils/mailer.js";

export const AuthService = {
    register: async (userData) => {
        try {
            const { email, password, first_name, last_name, role, speciality } = userData;

            let user = await User.findOne({ email }).setOptions({ skipDeletedFilter: true });
            if (user && !user.deleted) {
                throw ApiError.badRequest("El correo ya está registrado");
            }

            if (user && user.deleted) {
                user.password = password;
                user.first_name = first_name;
                user.last_name = last_name;
                user.role = role;
                user.speciality = speciality;
                user.deleted = false;
                await user.save();
            } else {
                user = await User.create({
                    email,
                    password,
                    first_name,
                    last_name,
                    role,
                    speciality,
                    deleted: false,
                });
            }
            
            const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
                expiresIn: "30d",
            });

            const userObj = user.toObject();
            delete userObj.password;

            return {
                user: userObj,
                token,
            };
        } catch (error) {
            throw error;
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
            throw error;
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
            throw error;
        }
    },
};
