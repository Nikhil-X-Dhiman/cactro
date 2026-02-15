import { PrismaClient } from '@prisma/client'
import { notificationQueue } from '../jobs/notificationQueue'

const prisma = new PrismaClient()

export const createEvent = async (data: any, organizerId: number) => {
  return prisma.event.create({
    data: { ...data, organizerId },
  })
}

export const getEvents = async () => {
  return prisma.event.findMany({
    include: {
      organizer: {
        select: { email: true, id: true },
      },
    },
  })
}

export const updateEvent = async (
  id: number,
  data: any,
  organizerId: number,
) => {
  const event = await prisma.event.findUnique({ where: { id } })
  if (!event) {
    const error: any = new Error('Event not found')
    error.status = 404
    throw error
  }

  if (event.organizerId !== organizerId) {
    const error: any = new Error('Unauthorized')
    error.status = 403
    throw error
  }

  const updatedEvent = await prisma.event.update({
    where: { id },
    data,
  })

  // Trigger notification job if event details (like date, location, title) change
  // For simplicity, we trigger it on any update
  await notificationQueue.add('event-update', {
    eventId: updatedEvent.id,
    eventTitle: updatedEvent.title,
    message: `Event '${updatedEvent.title}' has been updated. Check the new details!`,
  })

  return updatedEvent
}

export const deleteEvent = async (id: number, organizerId: number) => {
  const event = await prisma.event.findUnique({ where: { id } })
  if (!event) {
    const error: any = new Error('Event not found')
    error.status = 404
    throw error
  }
  if (event.organizerId !== organizerId) {
    const error: any = new Error('Unauthorized')
    error.status = 403
    throw error
  }

  // Trigger notification job for event cancellation
  await notificationQueue.add('event-cancellation', {
    eventId: event.id,
    eventTitle: event.title,
    message: `IMPORTANT: Event '${event.title}' has been CANCELLED. Refunds will be processed shortly.`,
  })

  return prisma.event.delete({ where: { id } })
}
