import { dynamicBatchIterator } from './utils/utils'
import { WorkerPool } from './worker_pool'
import { getLogger } from './utils/logger'

const _logger = getLogger('BatchWorkExecutor')

export class BatchWorkExecutor<Args extends any[], Ret = any> {
    private batchSize: number
    private maxWorkers: number
    private workerPool: WorkerPool<any> | undefined

    constructor(batchSize: number, maxWorkers: number) {
        this.batchSize = batchSize
        this.maxWorkers = maxWorkers
    }

    async execute(
        workIterable: Iterable<any>,
        workerFile: string,
        ...args: Args
    ): Promise<any[]> {
        this.workerPool = new WorkerPool(workerFile, {
            maxWorkers: this.maxWorkers,
        })
        _logger.info(`WorkerPool created.`)

        let result: Array<any> = []
        for (const batch of dynamicBatchIterator(
            workIterable,
            () => this.batchSize
        )) {
            result.push(this.workerPool.run(batch, ...args))
        }

        result = await Promise.all(result)
        return result
    }

    shutdown() {
        _logger.info('Shutting down WorkerPool...')
        this.workerPool?.shutdown()
    }
}
