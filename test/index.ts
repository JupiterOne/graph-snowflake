async function* simpleAsyncIterator<T = any>(array: T[]): AsyncIterable<T> {
  for (const row of array) {
    yield row;
  }
}

async function iterableToArray<T = any>(it: AsyncIterable<T>): Promise<T[]> {
  const results = [];
  for await (const row of it) {
    results.push(row);
  }
  return results;
}

function redactPollyEntry(entry: any): void {
  const text = entry.response.content.text;
  const json = JSON.parse(text);
  json.data.masterToken = '[REDACTED]';
  json.data.token = '[REDACTED]';
  entry.response.content.text = JSON.stringify(json);
}

export { simpleAsyncIterator, iterableToArray, redactPollyEntry };
