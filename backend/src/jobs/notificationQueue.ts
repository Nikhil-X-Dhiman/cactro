import { Queue, Worker } from 'bullmq'
import IORedis from 'ioredis'
import { logger } from '../utils/logger'
import dotenv from 'dotenv'
dotenv.config()

const connection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
})

export const notificationQueue = new Queue('notification-queue', {
  connection: connection as any,
})

const worker = new Worker(
  'notification-queue',
  async (job) => {
    const { eventId, eventTitle, message } = job.data
    logger.info(`Processing notification for event ${eventId}: ${eventTitle}`)

    // Requirement: "A console log / print statement indicating notification is sufficient"
    // In a real app, we would query bookings for this event and email users.
    const jobType =
      job.name === 'event-cancellation' ? 'CANCELLATION' : 'UPDATE'
    logger.info(
      `[NOTIFICATION] SIMULATION: Sending ${jobType} to all customers who booked event '${eventTitle}': "${message}"`,
    )
  },
  { connection: connection as any },
)

worker.on('completed', (job) => {
  logger.info(`Notification job ${job.id} completed`)
})

worker.on('failed', (job, err) => {
  logger.error(`Notification job ${job?.id} failed`, err)
})
