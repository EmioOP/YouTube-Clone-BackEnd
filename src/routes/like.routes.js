import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js"
import {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    allLikedVideos
} from "../controllers/like.controllers.js"

const router = Router()

router.use(verifyJWT)

router.route("/video/:videoId").post(toggleVideoLike)
router.route("/comment/:commentId").post(toggleCommentLike)
router.route("/tweet/:tweetId").post(toggleTweetLike)
router.route("/videos").get(allLikedVideos)

export default router