import { AuthService } from "./auth.service";

export const AuthController = {
    login: async(req, res) => {
        const { email, password } = req.body;

        try {
            const response = await AuthService.login(email, password);
            return res.status(200).json(response);
        }
    }
}