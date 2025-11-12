import mongoose from "mongoose";

const responseSchema = new mongoose.Schema(
    {
        survey: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Survey",
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        answers: [
            {
                question: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Question",
                    required: true,
                },
                rating: {
                    type: Number,
                    required: true,
                    min: [1, "La puntuación mínima es 1"],
                    max: [5, "La puntuación máxima es 5"],
                },
            },
        ],
        comment: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true }
);

responseSchema.index({ survey: 1, user: 1 }, { unique: true });

export const Response = mongoose.model("Response", responseSchema);
