import { Router } from "express";
import { publishVideo } from "../controllers/video.controllers,js";
import { upload } from "../middlewares/multer.middleware.js";


const router =  Router()

router.route("/video").post(verifyJWT,upload.fields(
    [
        {name:"videoFile",maxCount:1},
        {name:"thumbnail",maxCount:1}
    ]),publishVideo)





export default router