/**
 * Authentication Controller
 * Handles HTTP layer for authentication endpoints
 */

import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { log } from '../services/loggingService';
import {
  AuthenticatedRequest,
  asyncHandler,
  ValidationError,
} from '../middleware/authMiddleware';
import { errorHandler } from '../middleware/errorHandler';
import { validateData, assertValidation } from '../utils/validators';
import Joi from 'joi';

/**
 * Validation schemas
 */
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(12).required(),
  firstName: Joi.string().min(1).max(50).required(),
  lastName: Joi.string().min(1).max(50).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

/**
 * Authentication controller
 */
export class AuthController {
  /**
   * Register new user
   * POST /auth/register
   */
  static register = asyncHandler(async (req: Request, res: Response) => {
    // Validate request
    const result = validateData(req.body, registerSchema);
    const { email, password, firstName, lastName } = assertValidation(result);

    // Register user
    const auth = await authService.register(email, password, firstName, lastName);

    log.info('User registration successful', { email });

    // Send response
    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: auth,
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * Login user
   * POST /auth/login
   */
  static login = asyncHandler(async (req: Request, res: Response) => {
    // Validate request
    const result = validateData(req.body, loginSchema);
    const { email, password } = assertValidation(result);

    // Get client IP
    const ipAddress = req.ip || req.socket.remoteAddress;

    // Login user
    const auth = await authService.login(email, password, ipAddress);

    log.info('User login successful', { email, ipAddress });

    // Send response
    res.status(200).json({
      status: 'success',
      message: 'User logged in successfully',
      data: auth,
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * Refresh token
   * POST /auth/refresh
   */
  static refresh = asyncHandler(async (req: Request, res: Response) => {
    // Validate request
    const result = validateData(req.body, refreshSchema);
    const { refreshToken } = assertValidation(result);

    // Refresh token
    const tokens = await authService.refreshToken(refreshToken);

    log.info('Token refreshed');

    // Send response
    res.status(200).json({
      status: 'success',
      message: 'Token refreshed successfully',
      data: tokens,
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * Logout user
   * POST /auth/logout
   */
  static logout = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.userId;

    if (!userId) {
      throw new ValidationError('User ID not found in token');
    }

    // Logout user
    await authService.logout(userId);

    log.info('User logged out', { userId });

    // Send response
    res.status(200).json({
      status: 'success',
      message: 'User logged out successfully',
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * Verify token
   * GET /auth/verify
   */
  static verify = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.userId;

    if (!userId) {
      throw new ValidationError('User ID not found in token');
    }

    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ValidationError('Authorization header missing');
    }

    const token = authHeader.substring(7);

    // Verify token
    const payload = await authService.verifyToken(token);

    log.info('Token verified', { userId });

    // Send response
    res.status(200).json({
      status: 'success',
      message: 'Token is valid',
      data: {
        userId: payload.userId,
        email: payload.email,
        roles: payload.roles,
        valid: true,
      },
      timestamp: new Date().toISOString(),
    });
  });
}

export default AuthController;
