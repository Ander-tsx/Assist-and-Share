import { ApiResponse } from "../../utils/ApiResponse";
import { controllerError } from "../../utils/controllerError";
import { QuestionService } from "./question.service";

export const QuestionController = {
    createQuestions: async (req, res) => {
        try {
            const surveyId = req.params.surveyId;
            const questions = req.body;

            if (!Array.isArray(questions) || questions.length === 0) {
                return ApiResponse.error(res, "Se debe proporcionar un arreglo no vacío de preguntas");
            }

            const newQuestions = await QuestionService.createQuestions(surveyId, questions);
            return ApiResponse.success(res, {
                message: "Preguntas creadas correctamente",
                value: newQuestions,
            });
        } catch (error) {
            return controllerError(res, error);
        }
    },

    getQuestionsBySurvey: async (req, res) => {
        try {
            const surveyId = req.params.surveyId;
            const questions = await QuestionService.getQuestionsBySurvey(surveyId);
            return ApiResponse.success(res, {
                message: "Preguntas obtenidas correctamente",
                value: questions,
            });
        } catch (error) {
            return controllerError(res, error);
        }
    },

    updateQuestion: async (req, res) => {
        try {
            const { surveyId, questionId } = req.params;
            const data = req.body;
            const updatedQuestion = await QuestionService.updateQuestion(surveyId, questionId, data);
            return ApiResponse.success(res, {
                message: "Pregunta actualizada correctamente",
                value: updatedQuestion,
            });
        } catch (error) {
            return controllerError(res, error);
        }
    },

    deleteQuestion: async (req, res) => {
        try {
            const { surveyId, questionId } = req.params;
            await QuestionService.deleteQuestion(surveyId, questionId);
            return ApiResponse.success(res, {
                message: "Pregunta eliminada correctamente",
            });
        } catch (error) {
            return controllerError(res, error);
        }
    },
};