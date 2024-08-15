import { Router } from "express";
const router= Router()
import { createSubTask, createTask, deleteTaskById, updateTaskTitleById } from "../controllers/task.controller";
router.route('/create-task').post(createTask)
router.route('/delete-task/:id').delete(deleteTaskById)
router.route('/update-task-title/:id').patch(updateTaskTitleById)
router.route('/create-subtask/:id').post(createSubTask)
export default router