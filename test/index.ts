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

function redactRequestData(data: any) {
  const accountName = data['ACCOUNT_NAME'];
  const loginName = data['LOGIN_NAME'];
  const password = data['PASSWORD'];
  if (accountName) {
    data['ACCOUNT_NAME'] = '[REDACTED]';
  }
  if (loginName) {
    data['LOGIN_NAME'] = '[REDACTED]';
  }
  if (password) {
    data['PASSWORD'] = '[REDACTED]';
  }
  const environment = data['CLIENT_ENVIRONMENT'];
  if (environment) {
    for (const key of Object.keys(environment)) {
      environment[key] = '[REDACTED]';
    }
  }
  return data;
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
    name,
    options: {
      matchRequestsBy: {
        method: true,
        headers: false,
        order: false,
        body: (body: any) => {
          const unzippedBody = unzip(body);
          const json = JSON.parse(unzippedBody.toString());
          if (json.data && typeof json.data === 'object') {
            const data = json.data;
            const redactedData = redactRequestData(data);
            json.data = redactedData;
          }
          return JSON.stringify(json);
        },
        url: {
          query: false,
          pathname: true,

          hostname: false,
          protocol: false,
          username: false,
          password: false,
          port: false,
          hash: false,
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
    const unzippedBody = unzip(request.body);
    request.body = unzippedBody.toString();
    request.setHeader('content-length', unzippedBody.byteLength);
  }
}

function unzip(zipped: any) {
  const unzippedBody = zlib.unzipSync(zipped);
  return unzippedBody;
}

function redactPollyEntry(entry: any): void {
  const requestPostData = entry.request.postData;
  if (requestPostData && requestPostData.text) {
    const requestText = entry.request.postData.text;
    const requestJson = JSON.parse(requestText);
    if (requestJson.data) {
      const data = requestJson.data;
      const redactedData = redactRequestData(data);
      entry.request.postData.text = JSON.stringify({ data: redactedData });
    }
  }

  const responseText = entry.response.content.text;

  const responseJson = JSON.parse(responseText);
  if (responseJson.data) {
    if (responseJson.data.masterToken) {
      responseJson.data.masterToken = '[REDACTED]';
    }
    if (responseJson.data.token) {
      responseJson.data.token = '[REDACTED]';
    }
    if (responseJson.data.sessionId) {
      responseJson.data.sessionId = '[REDACTED]';
    }
  }
  entry.response.content.text = JSON.stringify(responseJson);
}

export {
  simpleAsyncIterator,
  iterableToArray,
  redactPollyEntry,
  setupDefaultRecording,
};
