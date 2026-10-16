import { Request, Response, NextFunction } from 'express';
import { OverviewService } from '../services/overview.service';

export function getMetrics(_req: Request, res: Response, next: NextFunction): void {
  try {
    const data = OverviewService.getMetrics();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export function getOrders(_req: Request, res: Response, next: NextFunction): void {
  try {
    const data = OverviewService.getOrders();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export function getMonthlyRevenue(_req: Request, res: Response, next: NextFunction): void {
  try {
    const data = OverviewService.getMonthlyRevenue();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export function getFullOverview(_req: Request, res: Response, next: NextFunction): void {
  try {
    const metrics = OverviewService.getMetrics();
    const orders = OverviewService.getOrders();
    const revenue = OverviewService.getMonthlyRevenue();

    res.status(200).json({
      success: true,
      data: {
        metrics,
        orders,
        revenue,
      },
    });
  } catch (error) {
    next(error);
  }
}
