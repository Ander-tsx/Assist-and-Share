import { ApiResponse } from "../../utils/ApiResponse.js";
import { controllerError } from "../../utils/controllerError.js";
import { getQueryOptions } from "../../utils/getQueryOptions.js";
import { SurveyService } from "./survey.service.js";

export const SurveyController = {
    createSurvey: async (req, res) => {
        try {
            const data = req.body;
            const newSurvey = await SurveyService.createSurvey(data);
            return ApiResponse.success(res, {
                message: "Encuesta creada correctamente",
                value: newSurvey,
            });
        } catch (error) {
            return controllerError(res, error);
        }
    },

    getAllSurveys: async (req, res) => {
        try {
            const options = getQueryOptions(req);
            const result = await SurveyService.getAllSurveys(options);
            return ApiResponse.success(res, {
                message: "Encuestas obtenidas correctamente",
                value: result,
            });
        } catch (error) {
            return controllerError(res, error);
        }
    },

    getSurveyById: async (req, res) => {
        try {
            const surveyId = req.params.surveyId;
            const survey = await SurveyService.getSurveyById(surveyId);
            return ApiResponse.success(res, {
                message: "Encuesta obtenida correctamente",
                value: survey,
            });
        } catch (error) {
            return controllerError(res, error);
        }
    },

    updateSurvey: async (req, res) => {
        try {
            const { surveyId } = req.params;
            const data = req.body;
            const updatedSurvey = await SurveyService.updateSurvey(surveyId, data);
            return ApiResponse.success(res, {
                message: "Encuesta actualizada correctamente",
                value: updatedSurvey,
            });
        } catch (error) {
            return controllerError(res, error);
        }
    },
    
    deleteSurvey: async (req, res) => {
        try {
            const { surveyId } = req.params;
            await SurveyService.deleteSurvey(surveyId);
            return ApiResponse.success(res, {
                message: "Encuesta eliminada correctamente",
            });
        } catch (error) {
            return controllerError(res, error);
        }
    },
};