import { cpus } from 'node:os'
import { Worker as _Worker } from 'node:worker_threads'
import { getLogger } from './utils/logger'

const _logger = getLogger('WorkerPool')

interface NodeWorker extends _Worker {
    currentResolve: ((value: any) => void) | null
    currentReject: ((err: Error) => void) | null
}

export interface Options {
    maxWorkers?: number
}

export class WorkerPool<Args extends any[], Ret = any> {
    private workerFile: string
    private maxWorkers: number

    private pool: NodeWorker[] = []
    private idlePool: NodeWorker[] = []
    private queue: [(worker: NodeWorker) => void, (err: Error) => void][] = []

    constructor(workerFile: string, options: Options = {}) {
        this.workerFile = workerFile
        this.maxWorkers = options.maxWorkers || Math.max(1, cpus().length - 1)
    }

    async run(...args: Args): Promise<Ret> {
        const worker = await this._getAvailableWorker()
        return new Promise<Ret>((resolve, reject) => {
            worker.currentResolve = resolve
            worker.currentReject = reject
            worker.postMessage(args)
        })
    }

    stop() {
        this.pool.forEach((w) => w.unref())
        this.queue.forEach(([_, reject]) => {
            reject(new Error('Main worker pool stopped before a worker was available.'))
        })
        this.pool = []
        this.idlePool = []
        this.queue = []
    }

    shutdown() {
        this.pool.forEach((w) => w.terminate())
        this.idlePool.forEach((w) => w.terminate())
    }

    private async _getAvailableWorker(): Promise<NodeWorker> {
        if (this.idlePool.length) {
            return this.idlePool.shift()!
        }

        if (this.pool.length < this.maxWorkers) {
            const worker = new _Worker(this.workerFile, {}) as NodeWorker

            worker.on('message', (res) => {
                worker.currentResolve && worker.currentResolve(res)
                worker.currentResolve = null
                this._assignDoneWorker(worker)
            })

            worker.on('error', (err) => {
                worker.currentReject && worker.currentReject(err)
                worker.currentReject = null
            })

            worker.on('exit', (code) => {
                const i = this.pool.indexOf(worker)
                if (i > -1) {
                    this.pool.splice(i, 1)
                    _logger.info('Worker stopped')
                }
                if (code !== 0 && worker.currentReject) {
                    worker.currentReject(
                        new Error(`Worker stopped with non-0 exit code ${code}`)
                    )
                    worker.currentReject = null
                }
            })

            _logger.info('Worker created successfully.')
            this.pool.push(worker)
            return worker
        }

        let resolve: (worker: NodeWorker) => void
        let reject: (err: Error) => any
        const onWorkerAvailablePromise = new Promise<NodeWorker>((r, rj) => {
            resolve = r
            reject = rj
        })
        this.queue.push([resolve!, reject!])
        return onWorkerAvailablePromise
    }

    private _assignDoneWorker(worker: NodeWorker) {
        if (this.queue.length) {
            const [resolve] = this.queue.shift()!
            resolve(worker)
            return
        }

        this.idlePool.push(worker)
    }
}
