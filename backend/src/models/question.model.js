import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
    {
        survey: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Survey",
            required: true,
        },
        text: {
            type: String,
            required: [true, "El texto de la pregunta es obligatorio"],
        },
        order: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

export const Question = mongoose.model("Question", questionSchema);
