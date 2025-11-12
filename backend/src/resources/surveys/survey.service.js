import { Survey } from "../../models/survey.model";
import { ApiError } from "../../utils/ApiError";
import { buildQuery } from "../../utils/queryBuilder";

export const SurveyController = {
    getAllSurveys: async (options) => {
        try {
            return await buildQuery(Survey, options);
        } catch (error) {
            throw ApiError.internal("Error al obtener las encuestas");
        }
    },

    getSurveyById: async (surveyId) => {
        try {
            return await Survey.findById(surveyId);
        } catch (error) {
            throw ApiError.internal("Error al obtener la encuesta");
        }
    },

    createSurvey: async (data) => {
        try {
            const newSurvey = await Survey.create(data);
            return newSurvey;
        } catch (error) {
            throw ApiError.internal("Error al crear la encuesta");
        }
    },

    updateSurvey: async (surveyId, data) => {
        try {
            const survey = await Survey.findById(surveyId);
            if (!survey) throw ApiError.notFound("Encuesta no encontrada");

            const updatedSurvey = await Survey.findByIdAndUpdate(surveyId, data, { new: true });
            return updatedSurvey;
        } catch (error) {
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