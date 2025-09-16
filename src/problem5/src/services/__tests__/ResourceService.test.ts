import { ResourceService } from '../ResourceService';
import { PrismaClient } from '@prisma/client';

type MockedResourceDelegate = {
	create: jest.Mock;
	findMany: jest.Mock;
	count: jest.Mock;
	findUnique: jest.Mock;
	update: jest.Mock;
	delete: jest.Mock;
};

function createMockPrisma(): {
	prisma: Partial<PrismaClient> & { resource: MockedResourceDelegate };
} {
	const resource: MockedResourceDelegate = {
		create: jest.fn(),
		findMany: jest.fn(),
		count: jest.fn(),
		findUnique: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
	};
	return { prisma: { resource } as any };
}

describe('ResourceService', () => {
	let service: ResourceService;
	let prismaMock: ReturnType<typeof createMockPrisma>['prisma'];

	beforeEach(() => {
		({ prisma: prismaMock } = createMockPrisma());
		service = new ResourceService(prismaMock as unknown as PrismaClient);
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	test('create() creates and returns resource', async () => {
		const created: any = { id: 'id-1', name: 'n', description: null };
		prismaMock.resource.create.mockResolvedValue(created);

		const result = await service.create({ name: 'n' });
		expect(prismaMock.resource.create).toHaveBeenCalledWith({
			data: { name: 'n', description: null },
		});
		expect(result).toEqual(created);
	});

	test('list() returns items and total with filtering and paging', async () => {
		const items: any[] = [
			{ id: 'a', name: 'alpha', description: null },
			{ id: 'b', name: 'beta', description: 'd' },
		];
		prismaMock.resource.findMany.mockResolvedValue(items);
		prismaMock.resource.count.mockResolvedValue(42);

		const result = await service.list({ name: 'a', skip: 10, take: 5 });

		expect(prismaMock.resource.findMany).toHaveBeenCalledWith({
			where: { name: { contains: 'a', mode: 'insensitive' } },
			orderBy: { createdAt: 'desc' },
			skip: 10,
			take: 5,
		});
		expect(prismaMock.resource.count).toHaveBeenCalledWith({
			where: { name: { contains: 'a', mode: 'insensitive' } },
		});
		expect(result).toEqual({ items, total: 42 });
	});

	test('list() without filter', async () => {
		prismaMock.resource.findMany.mockResolvedValue([]);
		prismaMock.resource.count.mockResolvedValue(0);

		await service.list({});

		expect(prismaMock.resource.findMany).toHaveBeenCalledWith({
			where: undefined,
			orderBy: { createdAt: 'desc' },
			skip: undefined,
			take: undefined,
		});
		expect(prismaMock.resource.count).toHaveBeenCalledWith({ where: undefined });
	});

	test('getById() returns resource when found', async () => {
		const entity: any = { id: 'id-1', name: 'one', description: null };
		prismaMock.resource.findUnique.mockResolvedValue(entity);

		const result = await service.getById('id-1');
		expect(prismaMock.resource.findUnique).toHaveBeenCalledWith({ where: { id: 'id-1' } });
		expect(result).toEqual(entity);
	});

	test('getById() throws 404 when not found', async () => {
		prismaMock.resource.findUnique.mockResolvedValue(null);
		await expect(service.getById('missing')).rejects.toMatchObject({ status: 404 });
	});

	test('update() returns updated resource', async () => {
		const entity: any = { id: 'id-1', name: 'new', description: 'd' };
		prismaMock.resource.update.mockResolvedValue(entity);

		const result = await service.update('id-1', { name: 'new', description: 'd' });
		expect(prismaMock.resource.update).toHaveBeenCalledWith({
			where: { id: 'id-1' },
			data: { name: 'new', description: 'd' },
		});
		expect(result).toEqual(entity);
	});

	test('update() maps Prisma P2025 to 404', async () => {
		const err = Object.assign(new Error('No record'), { code: 'P2025' });
		prismaMock.resource.update.mockRejectedValue(err);

		await expect(service.update('missing', { name: 'x' })).rejects.toMatchObject({ status: 404 });
	});

	test('remove() deletes resource', async () => {
		prismaMock.resource.delete.mockResolvedValue(undefined);
		await service.remove('id-1');
		expect(prismaMock.resource.delete).toHaveBeenCalledWith({ where: { id: 'id-1' } });
	});

	test('remove() maps Prisma P2025 to 404', async () => {
		const err = Object.assign(new Error('No record'), { code: 'P2025' });
		prismaMock.resource.delete.mockRejectedValue(err);
		await expect(service.remove('missing')).rejects.toMatchObject({ status: 404 });
	});
});
