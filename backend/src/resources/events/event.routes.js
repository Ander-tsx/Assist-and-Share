import express from "express";
import { EventController } from "./event.controller.js";
import upload from "../../middlewares/upload.js"

router.get("/", EventController.getAllEvents);
router.get("/:id", EventController.getEventById);
router.post("/", EventController.createEvent);
router.post("/:id/start", EventController.startEvent);
router.post("/:id/complete", EventController.completeEvent);
router.put("/:id", EventController.updateEvent);
router.delete("/:id", EventController.deleteEvent);

/* ======================================================
   NUEVA RUTA: Subir material a un evento
   POST /events/:id/material
====================================================== */
router.post(
  "/:id/material",
  upload.single("file"),               // ← middleware multer
  EventController.uploadMaterialToEvent // ← controlador correcto
);

export default router;
