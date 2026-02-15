import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { errorHandler } from './middlewares/errorHandler'
import authRoutes from './routes/auth.routes'
import eventRoutes from './routes/event.routes'
import bookingRoutes from './routes/booking.routes'

const app = express()

app.use(helmet())
app.use(cors())
app.use(morgan('dev'))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/bookings', bookingRoutes)

app.get('/', (req, res) => {
  res.send('Event Booking API is running')
})

// Global error handler must be last
app.use(errorHandler)

export default app
