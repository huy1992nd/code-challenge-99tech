import { Body, Delete, Get, Path, Post, Put, Query, Route, Tags } from 'tsoa';
import { PrismaClient, Resource } from '@prisma/client';
import { validate as validateUuid } from 'uuid';
import { ResourceService, CreateResourceRequest as ServiceCreate, UpdateResourceRequest as ServiceUpdate } from '../services/ResourceService';

export interface CreateResourceRequest {
	name: string;
	description?: string;
}

export interface UpdateResourceRequest {
	name?: string;
	description?: string;
}

export interface ListResourcesResponse {
	items: Resource[];
	total: number;
}

const service = new ResourceService();

@Route('resources')
@Tags('Resources')
export class ResourcesController {
	private prisma = new PrismaClient();

	@Post('/')
	public async create(@Body() body: CreateResourceRequest): Promise<Resource> {
		return service.create(body as ServiceCreate);
	}

	@Get('/')
	public async list(
		@Query() name?: string,
		@Query() skip?: number,
		@Query() take?: number
	): Promise<ListResourcesResponse> {
		return service.list({ name, skip, take });
	}

	@Get('{id}')
	public async get(@Path() id: string): Promise<Resource> {
		if (!validateUuid(id)) {
			throw { status: 400, message: 'Invalid id format (must be UUID)' } as any;
		}
		return service.getById(id);
	}

	@Put('{id}')
	public async update(@Path() id: string, @Body() body: UpdateResourceRequest): Promise<Resource> {
		if (!validateUuid(id)) {
			throw { status: 400, message: 'Invalid id format (must be UUID)' } as any;
		}
		return service.update(id, body as ServiceUpdate);
	}

	@Delete('{id}')
	public async remove(@Path() id: string): Promise<void> {
		if (!validateUuid(id)) {
			throw { status: 400, message: 'Invalid id format (must be UUID)' } as any;
		}
		await service.remove(id);
		return;
	}
}


