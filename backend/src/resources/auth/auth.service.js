import { User } from "../../models/user.model.js";
import { ApiError } from "../../utils/ApiError.js";
import jwt from "jsonwebtoken";

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
};
