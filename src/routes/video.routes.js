import { Router } from "express";
import {
    publishVideo,
    getVideo,
    getAllVideos,
    updateVideo,
    deleteVideo,
    togglePublishStatus
} from "../controllers/video.controllers,js";
import { upload } from "../middlewares/multer.middleware.js";



const router = Router()

router.route("/video").post(verifyJWT, upload.fields(
    [
        { name: "videoFile", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 }
    ]), publishVideo)

router.route("/").get(getAllVideos) // use verifyJWT middleware for checking user is loged in or not

router.route("/:videoId")
    .get(getVideo)
    .patch(verifyJWT, updateVideo)
    .delete(verifyJWT, deleteVideo)

router.route("/:videoId/toggle-publish").patch(verifyJWT, togglePublishStatus)


export default router