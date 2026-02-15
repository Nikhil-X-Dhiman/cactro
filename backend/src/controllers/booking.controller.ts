import { Request, Response, NextFunction } from 'express'
import * as bookingService from '../services/booking.service'

export const bookTickets = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { eventId, ticketsCount } = req.body

    if (!eventId || !ticketsCount) {
      return res
        .status(400)
        .json({ message: 'Missing fields: eventId, ticketsCount' })
    }

    if (ticketsCount <= 0) {
      return res.status(400).json({ message: 'Tickets count must be positive' })
    }

    const booking = await bookingService.createBooking(
      req.user!.id,
      parseInt(eventId),
      parseInt(ticketsCount),
    )
    res.status(201).json(booking)
  } catch (error) {
    next(error)
  }
}

export const getMyBookings = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const bookings = await bookingService.getUserBookings(req.user!.id)
    res.status(200).json(bookings)
  } catch (error) {
    next(error)
  }
}
