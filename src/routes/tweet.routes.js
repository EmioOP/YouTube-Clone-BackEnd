import { Router } from "express";
import {
    addTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
} from "../controllers/tweet.controllers.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/")
    .post(verifyJWT,addTweet)
    .get(verifyJWT,getUserTweets)
    .patch(verifyJWT,updateTweet)
    .delete(verifyJWT,deleteTweet)

export default router