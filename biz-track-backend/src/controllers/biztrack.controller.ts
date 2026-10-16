import { Request, Response, NextFunction } from 'express';
import { StorageService } from '../services/storage.service';
import { R2Service } from '../services/r2.service';

// --- Settings ---
export async function getSettings(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const settings = await StorageService.getSettings();
    res.status(200).json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
}

export async function updateSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const updated = await StorageService.updateSettings(req.body);
    res.status(200).json({ success: true, data: updated, message: 'Settings saved' });
  } catch (err) {
    next(err);
  }
}

// --- Orders ---
export async function getOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, search } = req.query;
    const orders = await StorageService.getOrders({
      status: typeof status === 'string' ? status : undefined,
      search: typeof search === 'string' ? search : undefined,
    });
    res.status(200).json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
}

export async function createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { customer, phone, address, quantity, date, status } = req.body;
    if (!customer || !phone || !address) {
      res.status(400).json({ success: false, message: 'Customer, phone, and address are required' });
      return;
    }
    const order = await StorageService.addOrder({
      customer,
      phone,
      address,
      quantity: Number(quantity) || 1,
      date,
      status: status || 'pending',
    });
    res.status(201).json({ success: true, data: order, message: 'Order added' });
  } catch (err) {
    next(err);
  }
}

export async function updateOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const updated = await StorageService.updateOrder(id, req.body);
    if (!updated) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }
    res.status(200).json({ success: true, data: updated, message: 'Order updated' });
  } catch (err) {
    next(err);
  }
}

export async function toggleOrderStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const updated = await StorageService.toggleOrderStatus(id);
    if (!updated) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }
    res.status(200).json({ success: true, data: updated, message: 'Order status updated' });
  } catch (err) {
    next(err);
  }
}

export async function completeDelivery(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    let imageUrl: string | null = null;

    // 1. Multipart file upload
    if (req.file) {
      imageUrl = await R2Service.uploadImage(req.file.buffer, req.file.originalname, req.file.mimetype);
    }
    // 2. Base64 payload upload
    else if (req.body?.imageBase64) {
      const b64 = req.body.imageBase64;
      const matches = b64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      let buffer: Buffer;
      let mime = 'image/jpeg';
      if (matches && matches.length === 3) {
        mime = matches[1];
        buffer = Buffer.from(matches[2], 'base64');
      } else {
        buffer = Buffer.from(b64, 'base64');
      }
      imageUrl = await R2Service.uploadImage(buffer, `order-${id}.jpg`, mime);
    }
    // 3. Pre-uploaded URL
    else if (req.body?.imageUrl) {
      imageUrl = req.body.imageUrl;
    }

    if (!imageUrl) {
      res.status(400).json({
        success: false,
        message: 'Delivery proof photo is required to complete delivery',
      });
      return;
    }

    const updated = await StorageService.completeDelivery(id, imageUrl);
    if (!updated) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: updated,
      message: 'Delivery completed successfully with proof photo',
    });
  } catch (err) {
    next(err);
  }
}

export async function uploadImage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let imageUrl: string | null = null;
    if (req.file) {
      imageUrl = await R2Service.uploadImage(req.file.buffer, req.file.originalname, req.file.mimetype);
    } else if (req.body?.imageBase64) {
      const b64 = req.body.imageBase64;
      const matches = b64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      let buffer: Buffer;
      let mime = 'image/jpeg';
      if (matches && matches.length === 3) {
        mime = matches[1];
        buffer = Buffer.from(matches[2], 'base64');
      } else {
        buffer = Buffer.from(b64, 'base64');
      }
      imageUrl = await R2Service.uploadImage(buffer, 'upload.jpg', mime);
    }

    if (!imageUrl) {
      res.status(400).json({ success: false, message: 'No image file or base64 data provided' });
      return;
    }

    res.status(200).json({ success: true, url: imageUrl });
  } catch (err) {
    next(err);
  }
}

export async function deleteOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const deleted = await StorageService.deleteOrder(id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Order deleted' });
  } catch (err) {
    next(err);
  }
}

// --- Transactions ---
export async function getTransactions(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const list = await StorageService.getTransactions();
    res.status(200).json({ success: true, data: list });
  } catch (err) {
    next(err);
  }
}

export async function createTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { type, description, amount, date } = req.body;
    if (!type || !description || amount === undefined) {
      res.status(400).json({ success: false, message: 'Type, description, and amount are required' });
      return;
    }
    const tx = await StorageService.addTransaction({
      type,
      description,
      amount: Number(amount),
      date,
    });
    res.status(201).json({ success: true, data: tx, message: 'Transaction saved' });
  } catch (err) {
    next(err);
  }
}

export async function deleteTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const deleted = await StorageService.deleteTransaction(id);
    if (!deleted) {
      res.status(404).json({ success: false, message: 'Transaction not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Transaction deleted' });
  } catch (err) {
    next(err);
  }
}

// --- Stats & Overview ---
export async function getStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const stats = await StorageService.getWeeklyStats();
    res.status(200).json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
}

// --- Backup & Reset ---
export async function exportData(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await StorageService.exportAll();
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function resetData(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await StorageService.resetAll();
    const data = await StorageService.exportAll();
    res.status(200).json({ success: true, data, message: 'App data reset to default' });
  } catch (err) {
    next(err);
  }
}
