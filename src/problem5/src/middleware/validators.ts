import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { validate as validateUuid } from 'uuid';

export const createResourceSchema = z.object({
	name: z.string().min(1).max(255),
	description: z.string().max(2000).optional().nullable()
});

export const updateResourceSchema = z
	.object({
		name: z.string().min(1).max(255).optional(),
		description: z.string().max(2000).optional().nullable()
	})
	.refine((data) => Object.keys(data).length > 0, { message: 'At least one field required' });


export function validateUuidParam(paramName: string) {
	return function (req: Request, res: Response, next: NextFunction): void {
		const id = req.params[paramName];
		if (!validateUuid(id)) {
			res.status(400).json({ error: `Invalid ${paramName} format (must be UUID)` });
			return;
		}
		next();
	};
}

export function validateResourceBody(req: Request, res: Response, next: NextFunction): void {
	try {
		if (req.method === 'POST') createResourceSchema.parse(req.body);
		if (req.method === 'PUT') updateResourceSchema.parse(req.body);
		return next();
	} catch (e: any) {
		const message = e?.errors ? e.errors.map((i: any) => i.message).join(', ') : 'Invalid request body';
		res.status(400).json({ error: message });
		return;
	}
}


