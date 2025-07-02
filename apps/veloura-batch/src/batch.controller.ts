import { Controller, Get, Logger } from '@nestjs/common';
import { BatchService } from './batch.service';
import { Cron, Interval, Timeout } from '@nestjs/schedule';
import { BATCH_ROLLBACK, BATCH_TOP_DESIGNERS, BATCH_TOP_PRODUCTS } from './lib/config';

@Controller()
export class BatchController {
	constructor(private readonly batchService: BatchService) {}
	private logger: Logger = new Logger('BatchController');

	@Timeout(1000)
	handleTimeout() {
		this.logger.debug('BATCH SERVER READY');
	}

	@Cron('00 * * * * *', { name: BATCH_ROLLBACK })
	public async batchRollback() {
		try {
			this.logger['context'] = BATCH_ROLLBACK;
			this.logger.debug('EXECTUTED!');
			await this.batchService.batchRollback();
		} catch (err) {
			this.logger.error(err);
		}
	}

	@Cron('20 * * * * *', { name: BATCH_TOP_PRODUCTS })
	public async batchTopProducts() {
		try {
			this.logger['context'] = BATCH_TOP_PRODUCTS;
			this.logger.debug('EXECTUTED');
			await this.batchService.batchTopProducts();
		} catch (err) {
			this.logger.error(err);
		}
	}

	@Cron('40 * * * * *', { name: BATCH_TOP_DESIGNERS })
	public async batchTopDesigners() {
		try {
			this.logger['context'] = BATCH_TOP_DESIGNERS;
			this.logger.debug('EXECTUTED');
			await this.batchService.batchTopDesigners();
		} catch (err) {
			this.logger.error(err);
		}
	}

	// @Interval(1000)
	// handleInterval() {
	//  this.logger.debug('Interval Test');
	// }

	@Get()
	getHello(): string {
		return this.batchService.getHello();
	}
}
