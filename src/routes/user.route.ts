import  { Router } from "express";
import { changePassword, getCurrentUser, getUserTasks, loginUser, logOutUser, registerUser, updateUsername } from "../controllers/user.controller";
import { verifyJWT } from "../middlewares/auth.middleware";
const router= Router()

router.route('/sign-up').post(registerUser)
router.route('/login').post(loginUser)
router.route('/logout').post(verifyJWT,logOutUser)
router.route('/change-password').patch(verifyJWT,changePassword)
router.route('/get-user').get(verifyJWT,getCurrentUser)
router.route('/get-tasks').get(verifyJWT,getUserTasks)
router.route('/update-username').post(verifyJWT,updateUsername)
export default router