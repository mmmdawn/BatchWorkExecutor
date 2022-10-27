import { dynamicBatchIterator } from './utils/utils';
import { Worker } from './worker_pool';
import { getLogger } from './utils/logger';

const _logger = getLogger('BatchWorkExecutor');

export class BatchWorkExecutor<Args extends any[], Ret = any> {
  private batchSize: number;
  private maxWorkers: number;
  private executor: Worker<any> | undefined;

  constructor(batchSize: number, maxWorkers: number) {
    this.batchSize = batchSize;
    this.maxWorkers = maxWorkers;
  }

  async execute(
    workIterable: Iterable<any>,
    workerFile: string,
    ...args: Args
  ) {
    this.executor = new Worker(workerFile, { maxWorkers: this.maxWorkers });
    _logger.info(`WorkerPool created.`);

    let result: Array<any> = [];
    for (const batch of dynamicBatchIterator(
      workIterable,
      () => this.batchSize
    )) {
      result.push(this.executor.run(batch, ...args));
    }

    result = await Promise.all(result);
    return result;
  }

  shutdown() {
    _logger.info('Shutting down WorkerPool...');
    this.executor?.shutdown();
  }
}
