import 'reflect-metadata';
import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import { PrismaClient, Resource } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { RegisterRoutes } from './generated/routes';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import { requestTiming } from './middleware/timing';
import { errorHandler } from './middleware/errorHandler';
import { validateUuidParam, validateResourceBody } from './middleware/validators';

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3000;
const prisma = new PrismaClient();

app.use(bodyParser.json());
app.use(requestTiming);

app.use((req: Request, _res: Response, next: NextFunction) => {
	console.log(`${req.method} ${req.path}`);
	next();
});

app.get('/health', async (_req: Request, res: Response) => {
	try {
		await prisma.$queryRaw`SELECT 1`;
		return res.json({ status: 'ok', db: 'up' });
	} catch (error) {
		console.error('Health check failed:', error);
		return res.status(503).json({ status: 'degraded', db: 'down' });
	}
});

RegisterRoutes(app);

const swaggerSpecPath = path.join(process.cwd(), 'src', 'generated', 'swagger.json');
let swaggerSpec: any = null;
try {
	const raw = fs.readFileSync(swaggerSpecPath, 'utf-8');
	swaggerSpec = JSON.parse(raw);
} catch (e) {
	console.warn('Swagger spec not found at', swaggerSpecPath, '\nRun: npm run tsoa:gen');
}

if (swaggerSpec) {
	app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
} else {
	app.get('/docs', (_req: Request, res: Response) => {
		res.status(500).send('Swagger spec not found. Run npm run tsoa:gen');
	});
}

app.use(errorHandler);

app.post('/resources', validateResourceBody,  async (req: Request, res: Response) => {
	try {
		const { name, description } = req.body as Partial<Resource>;
		if (!name || typeof name !== 'string') {
			return res.status(400).json({ error: 'name is required' });
		}
		const created = await prisma.resource.create({
			data: { id: uuidv4(), name, description: description ?? null }
		});
		return res.status(201).json(created);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: 'Failed to create resource' });
	}
});

app.get('/resources', async (req: Request, res: Response) => {
	try {
		const { name, skip, take } = req.query as Record<string, string | undefined>;
		const where = name ? { name: { contains: name, mode: 'insensitive' as const } } : undefined;
		const skipNum = skip ? Number(skip) : undefined;
		const takeNum = take ? Number(take) : undefined;
		const [items, total] = await Promise.all([
			prisma.resource.findMany({ where, orderBy: { createdAt: 'desc' }, skip: skipNum, take: takeNum }),
			prisma.resource.count({ where })
		]);
		return res.json({ items, total });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: 'Failed to fetch resources' });
	}
});

app.get('/resources/:id', validateUuidParam('id'), async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const resource = await prisma.resource.findUnique({ where: { id } });
		if (!resource) return res.status(404).json({ error: 'Resource not found' });
		return res.json(resource);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: 'Failed to fetch resource' });
	}
});

app.put('/resources/:id',  validateUuidParam('id'), validateResourceBody, async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const { name, description } = req.body as Partial<Resource>;
		const updated = await prisma.resource.update({
			where: { id },
			data: { name, description: description ?? null }
		});
		return res.json(updated);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: 'Failed to update resource' });
	}
});

app.delete('/resources/:id', validateUuidParam('id'), async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		await prisma.resource.delete({ where: { id } });
		return res.status(204).send();
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: 'Failed to delete resource' });
	}
});

app.listen(port, () => {
	console.log(`Server is running at http://localhost:${port}`);
});


