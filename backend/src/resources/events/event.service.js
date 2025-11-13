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
            throw error;
        }
    },

    createEvent: async (data) => {
        try {
            const newEvent = new Event(data);
            await newEvent.save();
            return newEvent;
        } catch (error) {
            throw error;
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
            throw error;
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
            throw error;
        }
    },
};
