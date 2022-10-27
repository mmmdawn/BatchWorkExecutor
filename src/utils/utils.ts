export function* dynamicBatchIterator(
  iterable: Iterable<any>,
  batchSizeGetter: () => number
): Generator<Array<any>> {
  let batch: Array<any> = [];
  let batchSize: number = batchSizeGetter();

  for (const item of iterable) {
    batch.push(item);
    if (batch.length >= batchSize) {
      yield batch;
      batch = [];
      batchSize = batchSizeGetter();
    }
  }

  if (batch.length > 0) {
    yield batch;
  }
}
