import express from "express";
import { requireAuth } from "../middleware";
import * as attendeeController from "../controllers/attendee.controller";

export const attendeeRouter = express.Router();

attendeeRouter.post("/respond", requireAuth, attendeeController.respond);
attendeeRouter.put("/availability/:eventId", requireAuth, attendeeController.availability);
attendeeRouter.put("/day-preference/:eventId", requireAuth, attendeeController.dayPreference);
attendeeRouter.delete("/leave/:eventId", requireAuth, attendeeController.leave);
