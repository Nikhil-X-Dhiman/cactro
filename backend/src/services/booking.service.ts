import { PrismaClient } from '@prisma/client'
import { emailQueue } from '../jobs/emailQueue'

const prisma = new PrismaClient()

export const createBooking = async (
  userId: number,
  eventId: number,
  ticketsCount: number,
) => {
  // Use transaction to ensure atomicity: verify availability, decrement tickets, create booking
  return prisma.$transaction(async (tx) => {
    const event = await tx.event.findUnique({ where: { id: eventId } })
    if (!event) {
      const error: any = new Error('Event not found')
      error.status = 404
      throw error
    }

    if (event.availableTickets < ticketsCount) {
      const error: any = new Error('Not enough tickets available')
      error.status = 400
      throw error
    }

    await tx.event.update({
      where: { id: eventId },
      data: { availableTickets: event.availableTickets - ticketsCount },
    })

    const booking = await tx.booking.create({
      data: {
        userId,
        eventId,
        ticketsCount,
      },
      include: {
        event: true, // This will now include the UPDATED event
      },
    })

    const user = await tx.user.findUnique({ where: { id: userId } })

    // Trigger background job
    await emailQueue.add('booking-confirmation', {
      email: user?.email,
      eventTitle: event.title,
      ticketsCount,
    })

    return booking
  })
}

export const getUserBookings = async (userId: number) => {
  return prisma.booking.findMany({
    where: { userId },
    include: { event: true },
  })
}
