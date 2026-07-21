import { Router } from "express";
import { messageController } from "../controllers/messageController.js";
import { requireAuth } from "../middleware/auth.js";
import { csrfGuard } from "../middleware/csrf.js";
import { validate } from "../middleware/validate.js";
import { messageSchema } from "../schemas/messageSchemas.js";

export const messagesRouter = Router();

messagesRouter.use(requireAuth);

messagesRouter.get("/", messageController.inbox);
messagesRouter.get("/:id", messageController.getById);
messagesRouter.post("/", csrfGuard, validate(messageSchema), messageController.send);
