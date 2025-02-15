import { Router } from "express";
import { verifyToken } from "../middlewares/authMiddleware";
import { fetchAllMessagesByConversationId } from "../controllers/messageController";

const router = Router();

router.get('/', verifyToken, fetchAllMessagesByConversationId);

export default router;

