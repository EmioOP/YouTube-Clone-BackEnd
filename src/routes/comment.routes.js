import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js"
import {
    addComment,
    getAllComment,
    getComment,
    updateComment,
    deleteComment
} from "../controllers/comment.controllers.js";

const router = Router()

router.route("/:videoId").get(getAllComment)
router.route("/comment/:videoId").post(verifyJWT, addComment)
router.route("/comment/:commentId")
    .get(getComment)
    .patch(verifyJWT, updateComment)
    .delete(verifyJWT, deleteComment)


export default router