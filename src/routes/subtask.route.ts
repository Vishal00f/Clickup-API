import Router from 'express'
import { updateTaskDescriptionById, updateTaskPriorityById, updateTaskStatusById, updateTaskTitleById } from '../controllers/subtask.controller'

const router = Router()

router.route('/update-title/:id').patch(updateTaskTitleById)
router.route('/update-description/:id').patch(updateTaskDescriptionById)
router.route('/update-priority/:id').patch(updateTaskPriorityById)
router.route('/update-status/:id').patch(updateTaskStatusById)
export default router