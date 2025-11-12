import mongoose from "mongoose";

const assistanceSchema = new mongoose.Schema(
    {
        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event",
            required: [true, "El evento es obligatorio"],
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "El usuario es obligatorio"],
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected", "attended", "cancelled"],
            default: "pending",
        },
        checkInTime: {
            type: Date,
        },
        registeredAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

assistanceSchema.index({ event: 1, user: 1 }, { unique: true });

assistanceSchema.pre("save", async function (next) {
    const event = await mongoose.model("Event").findById(this.event);
    if (!event) {
        return next(new Error("El evento no existe"));
    }
    if (event.date < new Date()) {
        return next(new Error("No se puede registrar a un evento que ya ocurrió"));
    }
    next();
});

export const Assistance = mongoose.model("Assistance", assistanceSchema);
