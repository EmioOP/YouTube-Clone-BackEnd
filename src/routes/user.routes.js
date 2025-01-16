import { Router } from "express";
import {
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser,
    changeCurrentPassword,
    getCurrentUser,
    updateAccontDetails,
    changeUserAvatar,
    changeUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router()

router.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ])
    , registerUser)

router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/user").get(verifyJWT, getCurrentUser)
router.route("/change-password").patch(verifyJWT, changeCurrentPassword)
router.route("/user/update-details").patch(verifyJWT, updateAccontDetails)
router.route("/user/change-avatar").patch(verifyJWT, upload.single("avatar"), changeUserAvatar)
router.route("/user/change-coverimage").patch(verifyJWT, upload.single("coverImage"), changeUserCoverImage)
router.route("/channel/:username").get(verifyJWT, getUserChannelProfile)
router.route("/user/watch-history").get(verifyJWT, getWatchHistory)



export default router