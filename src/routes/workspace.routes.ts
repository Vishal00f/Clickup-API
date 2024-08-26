import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { addUserToWorkspace, createWorkspace, updateDescription, updateName } from "../controllers/workspace.controller";

const router = Router()

router.route('/new').post(verifyJWT,createWorkspace)
router.route('/update-name').post(updateName)
router.route('/update-description').post(updateDescription)
router.route('/add-user').post(addUserToWorkspace)
export default router