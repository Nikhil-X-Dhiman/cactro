import { Router } from 'express'
import * as bookingController from '../controllers/booking.controller'
import { authenticate } from '../middlewares/auth.middleware'

const router = Router()

router.post('/', authenticate, bookingController.bookTickets)
router.get('/my-bookings', authenticate, bookingController.getMyBookings)

export default router
