import { Question } from "../../models/question.model";
import { ApiError } from "../../utils/ApiError";

export const QuestionService = {
    createQuestions: async (surveyId, questionsData) => {
        try {
            const questionsWithSurvey = questionsData.map((question) => ({
                ...question,
                survey: surveyId,
            }));

            const newQuestions = await Question.insertMany(questionsWithSurvey);
            return newQuestions;
        } catch (error) {
            throw ApiError.internal("Error al crear las preguntas");
        }
    },

    getQuestionsBySurvey: async (surveyId) => {
        try {
            return await Question.find({ survey: surveyId });
        } catch (error) {
            throw ApiError.internal("Error al obtener las preguntas");
        }
    },

    updateQuestion: async (surveyId, questionId, data) => {
        try {
            const question = await Question.findOne({ _id: questionId, survey: surveyId });
            if (!question) throw ApiError.notFound("Pregunta no encontrada");

            const updatedQuestion = await Question.findByIdAndUpdate(questionId, data, { new: true });
            return updatedQuestion;
        } catch (error) {
            throw ApiError.internal("Error al actualizar la pregunta");
        }
    },

    deleteQuestion: async (surveyId, questionId) => {
        try {
            const question = await Question.findOne({ _id: questionId, survey: surveyId });
            if (!question) throw ApiError.notFound("Pregunta no encontrada");

            await Response.deleteMany({ question: questionId });
            await Question.findByIdAndDelete(questionId);
        } catch (error) {
            throw ApiError.internal("Error al eliminar la pregunta");
        }
    },
};