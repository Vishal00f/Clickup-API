import { Router } from "express";
const router= Router()
import { createTask, deleteTaskById } from "../controllers/task.controller";
router.route('/create-task').post(createTask)
router.route('/delete-task/:id').delete(deleteTaskById)
export default router