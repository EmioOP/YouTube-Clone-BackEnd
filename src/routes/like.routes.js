import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js"
import {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    allLikedVideos
} from "../controllers/like.controllers.js"

const router = Router()


router.route("/video/:videoId").post(verifyJWT, toggleVideoLike)
router.route("/comment/:commentId").post(verifyJWT, toggleCommentLike)
router.route("/tweet/:tweetId").post(verifyJWT, toggleTweetLike)
router.route("/videos").get(verifyJWT, allLikedVideos)

export default router