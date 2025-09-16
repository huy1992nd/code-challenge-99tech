import { PrismaClient } from '@prisma/client';

export interface HealthStatus {
	status: string;
	db: string;
}

export class HealthService {
	private prisma: PrismaClient;

	constructor(prismaClient?: PrismaClient) {
		this.prisma = prismaClient ?? new PrismaClient();
	}

	public async check(): Promise<HealthStatus> {
		try {
			await this.prisma.$queryRaw`SELECT 1`;
			return { status: 'ok', db: 'up' };
		} catch {
			return { status: 'degraded', db: 'down' };
		}
	}
}
