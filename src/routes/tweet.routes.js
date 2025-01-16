import { Router } from "express";
import {
    addTweet,
    getUserTweets,
    updateTweet,
    deleteTweet,
    getTweetById
} from "../controllers/tweet.controllers.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()
router.use(verifyJWT)
router.route("/")
    .post(addTweet)
router.route("/:userId")
    .get(getUserTweets)
router.route("/tweet/:tweetId")
    .get(getTweetById)
    .patch(updateTweet)
    .delete(deleteTweet)

export default router