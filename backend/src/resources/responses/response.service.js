import { Response } from "../../models/response.model.js";
import { Question } from "../../models/question.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { Survey } from "../../models/survey.model.js";
import { Assistance } from "../../models/assistance.model.js";

export const ResponseService = {
    getAllResponses: async (surveyId) => {
        try {
            const responses = await Response.find({ survey: surveyId })
                .populate("user", "first_name last_name email")
                .populate("answers.question", "text");

            return responses;
        } catch (error) {
            throw error;
        }
    },

    getMyResponse: async (surveyId, userId) => {
        try {
            const response = await Response.findOne({ survey: surveyId, user: userId })
                .populate("answers.question", "text");

            if (!response) throw ApiError.notFound("No se encontró una respuesta para este usuario");

            return response;
        } catch (error) {
            throw error;
        }
    },

    createResponse: async (surveyId, userId, answers, comment) => {
        try {
            const survey = await Survey.findById(surveyId).populate("event");
            if (!survey) throw ApiError.notFound("Encuesta no encontrada");

            if (survey.event.deleted) {
                throw ApiError.badRequest("La encuesta pertenece a un evento eliminado");
            }

            const eventId = survey.event._id;

            const assistance = await Assistance.findOne({
                event: eventId,
                user: userId,
            });

            if (!assistance)
                throw ApiError.badRequest("No puedes responder la encuesta sin haber asistido al evento");

            if (assistance.status !== "attended")
                throw ApiError.forbidden("Solo los asistentes que han asistido al evento pueden responder la encuesta");

            const questionIds = answers.map(a => a.question);
            const questions = await Question.find({ _id: { $in: questionIds }, survey: surveyId });

            if (questions.length !== answers.length)
                throw ApiError.badRequest("Algunas preguntas no pertenecen a la encuesta o no existen");

            const existing = await Response.findOne({ survey: surveyId, user: userId });
            if (existing)
                throw ApiError.conflict("El usuario ya ha respondido esta encuesta");

            const newResponse = await Response.create({
                survey: surveyId,
                user: userId,
                answers,
                comment
            });

            return newResponse;
        } catch (error) {
            throw error;
        }
    },

    updateResponse: async (surveyId, responseId, userId, data) => {
        try {
            const response = await Response.findOne({ _id: responseId, survey: surveyId, user: userId });
            if (!response) throw ApiError.notFound("Respuesta no encontrada");

            if (!Array.isArray(data.answers) || data.answers.length === 0)
                throw ApiError.badRequest("Debe enviar un arreglo de respuestas");

            for (const a of data.answers) {
                if (a.rating < 1 || a.rating > 5)
                    throw ApiError.badRequest("Las puntuaciones deben estar entre 1 y 5");
            }

            response.answers = data.answers;

            if (data.comment !== undefined) {
                response.comment = data.comment;
            }

            await response.save();

            return response;
        } catch (error) {
            throw error;
        }
    },

    getSurveySummary: async (surveyId) => {
        try {
            const summary = await Response.aggregate([
                { $match: { survey: surveyId } },
                { $unwind: "$answers" },
                {
                    $group: {
                        _id: "$answers.question",
                        averageRating: { $avg: "$answers.rating" },
                        totalResponses: { $sum: 1 },
                    },
                },
                {
                    $lookup: {
                        from: "questions",
                        localField: "_id",
                        foreignField: "_id",
                        as: "question",
                    },
                },
                { $unwind: "$question" },
                {
                    $project: {
                        _id: 0,
                        questionId: "$question._id",
                        questionText: "$question.text",
                        averageRating: { $round: ["$averageRating", 2] },
                        totalResponses: 1,
                    },
                },
            ]);

            return summary;
        } catch (error) {
            throw error;
        }
    },
};