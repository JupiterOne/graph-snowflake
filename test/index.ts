import zlib from 'zlib';
import { Recording, setupRecording } from '@jupiterone/integration-sdk/testing';
import assert from 'assert';

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

function setupDefaultRecording({
  directory,
  name,
}: {
  directory: string;
  name: string;
}): Recording {
  const recording = setupRecording({
    directory,
    mutateEntry: redactPollyEntry,
    mutateRequest: unZipRequestBody,
    name: name,
    options: {
      matchRequestsBy: {
        body: true,
        url: {
          query: false,
        },
      },
    },
  });

  const mode = process.env.MODE || 'replay';
  const validModes = ['replay', 'record', 'passthrough'];
  assert.ok(
    validModes.includes(mode),
    `MODE env variable must be one of: ${validModes.toString()}`,
  );
  recording.configure({
    mode,
  });

  return recording;
}

function unZipRequestBody(request: any): void {
  const contentEncoding = request.getHeader('content-encoding');
  if (contentEncoding === 'gzip') {
    request.removeHeader('content-encoding');
    const unzippedBody = zlib.unzipSync(request.body);
    request.body = unzippedBody.toString();
    request.setHeader('content-length', unzippedBody.byteLength);
  }
}

function redactPollyEntry(entry: any): void {
  const text = entry.response.content.text;

  const json = JSON.parse(text);
  if (json.data) {
    if (json.data.masterToken) {
      json.data.masterToken = '[REDACTED]';
    }
    if (json.data.token) {
      json.data.token = '[REDACTED]';
    }
  }
  entry.response.content.text = JSON.stringify(json);
}

export {
  simpleAsyncIterator,
  iterableToArray,
  redactPollyEntry,
  setupDefaultRecording,
};
