import { Router } from 'express'
import * as eventController from '../controllers/event.controller'
import { authenticate, authorize } from '../middlewares/auth.middleware'
import { Role } from '@prisma/client'

const router = Router()

router.post(
  '/',
  authenticate,
  authorize([Role.ORGANIZER]),
  eventController.create,
)
router.get('/', eventController.list)
router.put(
  '/:id',
  authenticate,
  authorize([Role.ORGANIZER]),
  eventController.update,
)
router.delete(
  '/:id',
  authenticate,
  authorize([Role.ORGANIZER]),
  eventController.remove,
)

export default router
