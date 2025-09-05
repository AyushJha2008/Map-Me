import {Router} from 'express';
import { loggedOutUser, loginUser, refreshAccessToken, registerUser } from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJwt } from '../middlewares/auth.middleware.js';

const router = Router();
// this was our middleware
router.route("/register").post(
    upload.fields([{
        name: "avatar",
        maxCount: 1
    },
    {
        name: "coverImg",
        maxCount:1
    }]),
    registerUser) //is route pe jane se pehe mujhse milka jana
//localhost:8000/api/v1/users/register

router.route("/login").post(loginUser)

// secured route
router.route("/logout").post(verifyJwt, loggedOutUser)
router.route("/refresh-token").post(refreshAccessToken)

export default router