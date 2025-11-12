import { Response } from "../../models/response.model.js";
import { Question } from "../../models/question.model.js";
import { ApiError } from "../../utils/ApiError.js";

export const ResponseService = {
    createResponse: async (surveyId, userId, answers) => {
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
        });

        return newResponse;
    },
    getAllResponses: async (surveyId) => {
        const responses = await Response.find({ survey: surveyId })
            .populate("user", "first_name last_name email")
            .populate("answers.question", "text");

        return responses;
    },

    getMyResponse: async (surveyId, userId) => {
        const response = await Response.findOne({ survey: surveyId, user: userId })
            .populate("answers.question", "text");

        if (!response) throw ApiError.notFound("No se encontró una respuesta para este usuario");

        return response;
    },

    updateResponse: async (surveyId, responseId, userId, data) => {
        const response = await Response.findOne({ _id: responseId, survey: surveyId, user: userId });
        if (!response) throw ApiError.notFound("Respuesta no encontrada");

        if (!Array.isArray(data.answers) || data.answers.length === 0)
            throw ApiError.badRequest("Debe enviar un arreglo de respuestas");

        for (const a of data.answers) {
            if (a.rating < 1 || a.rating > 5)
                throw ApiError.badRequest("Las puntuaciones deben estar entre 1 y 5");
        }

        response.answers = data.answers;
        await response.save();

        return response;
    },

    getSurveySummary: async (surveyId) => {
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
    },
};
