import { Get, Route, Tags } from 'tsoa';
import { HealthService } from '../services/HealthService';

@Route('health')
@Tags('Health')
export class HealthController {
	private service = new HealthService();

	@Get('/')
	public async getHealth(): Promise<{ status: string; db: string }> {
		return this.service.check();
	}
}


