import { NextFunction, Request, Response } from 'express';

type ErrorLike = { status?: number; message?: string; details?: unknown } | unknown;

export function errorHandler(
	err: ErrorLike,
	_req: Request,
	res: Response,
	_next: NextFunction
): void {
	const status = typeof err?.status === 'number' ? err.status : 500;
	const message = err?.message || 'Internal server error';
	const details = process.env.NODE_ENV === 'production' ? undefined : err?.details || err;
	console.error('Error handler:', { status, message, details });
	res.status(status).json({ error: message });
}
