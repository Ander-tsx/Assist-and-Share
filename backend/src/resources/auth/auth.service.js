import { User } from "./user.model";

export const AuthService = {
    login: async(email, password) => {
        try {
            const user = User.findOne({email})
            if (!user) throw new Error("Usuario no encontrado");

            const isMatch = await user.matchPassword(password);
            if (!isMatch) throw new Error("Las contraseñas no coinciden");

            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
                expiresIn: "30d",
            })

            delete user.password;

            return {
                user, token
            }
        } catch (error) {
            console.error("Error en login:", error.message);
            throw new Error(error.message || "Error al iniciar sesión");
        }
    } 
}