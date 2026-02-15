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

export const emailQueue = new Queue('email-queue', {
  connection: connection as any,
})

const worker = new Worker(
  'email-queue',
  async (job) => {
    const { email, eventTitle, ticketsCount } = job.data
    logger.info(`Processing booking confirmation for ${email}`)

    // Requirement: "A console log / print statement indicating the email action is sufficient"
    logger.info(
      `[EMAIL] SIMULATION: Sending booking confirmation to ${email} for event '${eventTitle}' (${ticketsCount} tickets).`,
    )
  },
  { connection: connection as any },
)

worker.on('completed', (job) => {
  logger.info(`Email job ${job.id} completed`)
})

worker.on('failed', (job, err) => {
  logger.error(`Email job ${job?.id} failed`, err)
})
