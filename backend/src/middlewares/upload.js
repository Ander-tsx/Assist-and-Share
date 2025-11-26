import multer from "multer";

// Usamos memoria para poder mandar el buffer a Cloudinary
const storage = multer.memoryStorage();

export const upload = multer({ storage });
