import { BatchWorkExecutor } from '../batch_work_executor'

const numbers: number[] = []

for (let i = 1; i <= 1000; i++) {
    numbers.push(i)
}

const executor = new BatchWorkExecutor(50, 4, {})

const expectedResult = JSON.stringify([
    1275, 3775, 6275, 8775, 11275, 13775, 16275, 18775, 21275, 23775, 26275,
    28775, 31275, 33775, 36275, 38775, 41275, 43775, 46275, 48775,
])

test('basic', async () => {
    const result = await executor.execute(
        numbers,
        `${__dirname}/runnable.worker.js`
    )
    executor.shutdown()
    expect(JSON.stringify(result)).toBe(expectedResult)
})
