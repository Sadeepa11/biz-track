import { Request, Response } from 'express';

export function getHealth(_req: Request, res: Response): void {
  res.status(200).json({
    success: true,
    message: 'BizDesk Backend API is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}
