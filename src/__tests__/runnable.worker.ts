const { parentPort } = require('worker_threads')

parentPort.on('message', (args: any[]) => {
    const numbers: number[] = args[0]
    let sum = 0

    for (const number of numbers) {
        sum += number
    }

    parentPort.postMessage(sum)
})
