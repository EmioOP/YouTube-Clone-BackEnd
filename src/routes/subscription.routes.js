import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js"
import {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
} from "../controllers/subscription.controllers.js"

const router = Router()

router.use(verifyJWT) //use this middleware for all routes
router.route("/c/:channelId")
    .post(toggleSubscription)
    .get(getUserChannelSubscribers)
router.route("/u/:subscriberId").get(getSubscribedChannels)

export default router