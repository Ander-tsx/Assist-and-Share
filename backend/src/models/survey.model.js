import mongoose from "mongoose";

const surveySchema = new mongoose.Schema(
    {
        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event",
            required: true,
            unique: true,
        },
        title: {
            type: String,
            default: "Encuesta de retroalimentación",
        },
        description: {
            type: String,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

export const Survey = mongoose.model("Survey", surveySchema);
