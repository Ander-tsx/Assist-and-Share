import { Assistance } from "../../models/assistance.model.js"
import { ApiError } from "../../utils/ApiError.js";

export const AssistanceService = {
    createAssistance: async (eventId, userId) => {
        try {
            const newAssistance = await Assistance.create({
                event: eventId,
                user: userId,
                status: "pending",
            });
            return newAssistance;
        } catch (error) {
            throw error;
        }
    },

    cancelAssistance: async (assistanceId, userId) => {
        try {
            const assistance = await Assistance.findById(assistanceId);
            if (!assistance) {
                throw new ApiError.notFound("Asistencia no encontrada");
            }

            if (assistance.user.toString() !== userId) {
                throw new ApiError.forbidden("No tienes permiso para cancelar esta asistencia");
            }
            assistance.status = "cancelled";
            await assistance.save();
            return assistance;
        } catch (error) {
            throw error;
        }
    },

    checkIn: async (assistanceId) => {
        //TODO
    },

    updateStatus: async (assistanceId, status) => {
        try {
            const assistance = await Assistance.findById(assistanceId);
            if (!assistance) {
                throw new ApiError.notFound("Asistencia no encontrada");
            }

            assistance.status = status;
            if (status === "attended") {
                assistance.checkInTime = new Date();
            }
            await assistance.save();
            return assistance;
        } catch (error) {
            throw error;
        }
    },

    getByUser: async (userId) => {
        try {
            const assistances = await Assistance.find({ user: userId }).populate("event");
            return assistances;
        } catch (error) {
            throw error;
        }
    },

    getByEvent: async (eventId) => {
        try {
            const assistances = await Assistance.find({ event: eventId }).populate("user");
            return assistances;
        } catch (error) {
            throw error;
        }
    },
};