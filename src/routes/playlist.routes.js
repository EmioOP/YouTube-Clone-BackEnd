import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js"
import {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlayList,
    updatePlaylist,
    deletePlaylist
} from "../controllers/playlist.controllers.js"

const router = Router()

router.route("/:userId").get(getUserPlaylists)
router.route("/playlist").post(verifyJWT,createPlaylist)
router.route("/playlist/:playlistId")
    .get(getPlaylistById)
    .patch(verifyJWT,updatePlaylist)
    .delete(verifyJWT,deletePlaylist)

router.route("/playlist/:playlistId/video/:videoId")
    .post(verifyJWT,addVideoToPlaylist)
    .delete(verifyJWT,removeVideoFromPlayList)



export default router