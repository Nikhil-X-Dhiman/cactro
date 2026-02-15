import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'secret'

export const registerUser = async (
  email: string,
  password: string,
  role: Role,
) => {
  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    const error: any = new Error('User already exists')
    error.status = 409
    throw error
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role,
    },
  })

  return { id: user.id, email: user.email, role: user.role }
}

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    const error: any = new Error('Invalid credentials')
    error.status = 401
    throw error
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    const error: any = new Error('Invalid credentials')
    error.status = 401
    throw error
  }

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: '1h',
  })
  return { token, user: { id: user.id, email: user.email, role: user.role } }
}
