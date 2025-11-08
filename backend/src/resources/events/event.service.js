import { buildQuery } from "../../utils/queryBuilder.js";
import { Event } from "../../models/event.model.js";
import { ApiError } from "../../utils/ApiError.js";

export const EventService = {
    getAllEvents: async (options) => {
        return await buildQuery(Event, options);
    },

    getEventById: async (id) => {
        try {
            const event = await Event.findById(id);
            if (!event) {
                throw ApiError.notFound("Evento no encontrado");
            }
            return event;
        } catch (error) {
            throw ApiError.internal("Error al obtener el evento");
        }
    },

    createEvent: async (data) => {
        try {
            const newEvent = new Event(data);
            await newEvent.save();
            return newEvent;
        } catch (error) {
            console.log(error);
            if (error.name === "ValidationError") {
                const messages = Object.values(error.errors).map((err) => err.message);
                throw ApiError.badRequest(messages.join(", "));
            }

            console.error("Error al crear evento:", error);
            throw ApiError.internal("Error al crear el evento");
        }
    },

    updateEvent: async (id, data) => {
        try {
            const event = await Event.findByIdAndUpdate(id, data, { new: true });
            if (!event) {
                throw ApiError.notFound("Evento no encontrado");
            }
            return event;
        } catch (error) {
            console.log(error);
            throw ApiError.internal("Error al actualizar el evento");
        }
    },

    deleteEvent: async (id) => {
        try {
            const deleted = await Event.findByIdAndDelete(id);
            if (!deleted) {
                throw ApiError.notFound("Evento no encontrado");
            }
            return deleted;
        } catch (error) {
            throw ApiError.internal("Error al eliminar el evento");
        }
    },
};
