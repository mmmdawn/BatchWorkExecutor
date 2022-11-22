import {dynamicBatchIterator} from './utils/utils'
import {WorkerPool} from './worker_pool'
import {getLogger} from './utils/logger'
import {WorkerOptions} from "node:worker_threads";

const _logger = getLogger('BatchWorkExecutor')

export class BatchWorkExecutor<Args extends any[], Ret = any> {
    private readonly batchSize: number
    private readonly maxWorkers: number
    private readonly workerOptions: WorkerOptions

    private workerPool: WorkerPool<any> | undefined

    constructor(batchSize: number, maxWorkers: number, workerOptions: WorkerOptions) {
        this.batchSize = batchSize
        this.maxWorkers = maxWorkers
        this.workerOptions = workerOptions
    }

    async execute(workIterable: Iterable<any>, workerFile: string, ...args: Args): Promise<any[]> {
        this.workerPool = WorkerPool.getInstance(workerFile, {
            maxWorkers: this.maxWorkers,
            workerOptions: this.workerOptions
        })

        let result: Array<any> = []
        for (const batch of dynamicBatchIterator(workIterable, () => this.batchSize)) {
            result.push(this.workerPool.run(batch, ...args))
        }

        result = await Promise.all(result)
        this.workerPool.stop()
        return result
    }

    shutdown() {
        _logger.info('Shutting down WorkerPool...')
        this.workerPool?.shutdown()
    }
}
