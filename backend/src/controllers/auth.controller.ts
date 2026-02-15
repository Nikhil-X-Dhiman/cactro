import { Request, Response, NextFunction } from 'express'
import * as authService from '../services/auth.service'
import { Role } from '@prisma/client'

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password, role } = req.body

    if (!email || !password || !role) {
      return res
        .status(400)
        .json({ message: 'Missing fields: email, password, role' })
    }

    if (!Object.values(Role).includes(role)) {
      return res
        .status(400)
        .json({
          message: `Invalid role. Must be one of: ${Object.values(Role).join(', ')}`,
        })
    }

    const user = await authService.registerUser(email, password, role)
    res.status(201).json({ message: 'User registered successfully', user })
  } catch (error) {
    next(error)
  }
}

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Missing fields: email, password' })
    }

    const result = await authService.loginUser(email, password)
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}
