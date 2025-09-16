import { PrismaClient, Resource } from '@prisma/client';

export interface CreateResourceRequest {
	name: string;
	description?: string | null;
}

export interface UpdateResourceRequest {
	name?: string;
	description?: string | null;
}

export interface ListResourcesResponse {
	items: Resource[];
	total: number;
}


export class ResourceService {
	private prisma: PrismaClient;

	constructor(prismaClient?: PrismaClient) {
		this.prisma = prismaClient ?? new PrismaClient();
	}

	public async create(payload: CreateResourceRequest): Promise<Resource> {
		return this.prisma.resource.create({
			data: { name: payload.name, description: payload.description ?? null }
		});
	}

	public async list(params: { name?: string; skip?: number; take?: number }): Promise<ListResourcesResponse> {
		const where = params.name ? { name: { contains: params.name, mode: 'insensitive' as const } } : undefined;
		const [items, total] = await Promise.all([
			this.prisma.resource.findMany({ where, orderBy: { createdAt: 'desc' }, skip: params.skip, take: params.take }),
			this.prisma.resource.count({ where })
		]);
		return { items, total };
	}

	public async getById(id: string): Promise<Resource> {
		const entity = await this.prisma.resource.findUnique({ where: { id } });
		if (!entity) {
			throw { status: 404, message: 'Resource not found' } as any;
		}
		return entity;
	}

	public async update(id: string, payload: UpdateResourceRequest): Promise<Resource> {
		try {
			return await this.prisma.resource.update({
				where: { id },
				data: { name: payload.name, description: payload.description ?? null }
			});
		} catch (e: any) {
			if (e?.code === 'P2025') {
				throw { status: 404, message: 'Resource not found' } as any;
			}
			throw e;
		}
	}

	public async remove(id: string): Promise<void> {
		try {
			await this.prisma.resource.delete({ where: { id } });
		} catch (e: any) {
			if (e?.code === 'P2025') {
				throw { status: 404, message: 'Resource not found' } as any;
			}
			throw e;
		}
	}
}


