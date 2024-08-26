import { Router } from "express";
const router= Router()
import { assignTaskTo, createSubTask, createTask, deleteTaskById, getAllSubtasksById, updateTaskTitleById } from "../controllers/task.controller";
router.route('/create-task').post(createTask)
router.route('/delete-task/:id').delete(deleteTaskById)
router.route('/update-task-title/:id').patch(updateTaskTitleById)
router.route('/create-subtask/:id').post(createSubTask)
router.route('/assign-task/:id').post(assignTaskTo)
router.route('/get-subtasks/:id').get(getAllSubtasksById)

export default router