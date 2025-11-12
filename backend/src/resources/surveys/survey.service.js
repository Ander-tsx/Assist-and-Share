import mongoose from "mongoose";
import { Survey } from "../../models/survey.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { buildQuery } from "../../utils/queryBuilder.js";
import { Question } from "../../models/question.model.js";
import { populate } from "dotenv";

export const SurveyService = {
    getAllSurveys: async (options) => {
        try {
            const queryOptions = {
                ...options,
                populate: [
                    {
                        path: "questions",
                        select: "text order"
                    },
                    {
                        path: "event",
                        select: "title date modality"
                    }
                ]
            }
            const result = await buildQuery(Survey, queryOptions);
            return result;
        } catch (error) {
            throw ApiError.internal("Error al obtener las encuestas");
        }
    },

    getSurveyById: async (surveyId) => {
        try {
            const survey = await Survey.findById(surveyId)
                .populate({
                    path: "questions",
                    select: "text order",
                })
                .populate({
                    path: "event",
                    select: "title date modality",
                })
                .lean();

            if (!survey) throw ApiError.notFound("Encuesta no encontrada");

            return survey;
        } catch (error) {
            throw ApiError.internal("Error al obtener la encuesta");
        }
    },

    createSurvey: async (data) => {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const { questions = [], ...surveyData } = data;

            const newSurvey = await Survey.create([surveyData], { session });
            const survey = newSurvey[0];

            if (!Array.isArray(questions) || questions.length < 1) {
                throw ApiError.badRequest("Debe proporcionar al menos una pregunta para la encuesta");
            }

            if (questions.some(q => !q.text || q.text.trim() === "")) {
                throw ApiError.badRequest("Todas las preguntas deben tener texto válido");
            }

            const questionsWithSurvey = questions.map((q) => ({
                ...q,
                survey: survey._id,
            }));

            await Question.insertMany(questionsWithSurvey, { session });

            await session.commitTransaction();
            session.endSession();

            const populatedSurvey = await Survey.findById(survey._id).populate("questions").lean();
            return populatedSurvey;
        } catch (error) {
            console.log(error);
            await session.abortTransaction();
            session.endSession();
            throw ApiError.internal("Error al crear la encuesta");
        }
    },

    updateSurvey: async (surveyId, data) => {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const survey = await Survey.findById(surveyId);
            if (!survey) throw ApiError.notFound("Encuesta no encontrada");

            const { questions, ...surveyData } = data;

            await Survey.findByIdAndUpdate(
                surveyId,
                surveyData,
                { new: true, session }
            );

            if (Array.isArray(questions)) {
                for (const q of questions) {
                    if (q._id) {
                        await Question.findOneAndUpdate(
                            { _id: q._id, survey: surveyId },
                            q,
                            { new: true, session }
                        );
                    } else {
                        await Question.create([{ ...q, survey: surveyId }], { session });
                    }
                }

                const sentIds = questions.filter(q => q._id).map(q => q._id.toString());
                await Question.deleteMany({
                    survey: surveyId,
                    _id: { $nin: sentIds },
                }).session(session);
            }

            await session.commitTransaction();
            session.endSession();

            const result = await Survey.findById(surveyId)
                .populate("event", "title date")
                .lean();

            return result;
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            console.error(error);
            throw ApiError.internal("Error al actualizar la encuesta");
        }
    },

    deleteSurvey: async (surveyId) => {
        try {
            const survey = await Survey.findById(surveyId);
            if (!survey) throw ApiError.notFound("Encuesta no encontrada");

            await Question.deleteMany({ survey: surveyId });

            await Response.deleteMany({ survey: surveyId });

            await Survey.findByIdAndDelete(surveyId);

            return { message: "Encuesta y datos relacionados eliminados correctamente" };
        } catch (error) {
            throw ApiError.internal("Error al eliminar la encuesta");
        }
    },
};