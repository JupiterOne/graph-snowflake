import {
  IntegrationExecutionContext,
  IntegrationValidationError,
} from '@jupiterone/integration-sdk-core';
import { createClient } from './client';

export default async function validateInvocation(
  context: IntegrationExecutionContext,
) {
  context.logger.info(
    {
      instance: context.instance,
    },
    'Validating integration config...',
  );

  if (await isConfigurationValid(context.logger, context.instance.config)) {
    context.logger.info('Integration instance is valid!');
  } else {
    throw new IntegrationValidationError(
      'Integration instance invalid, Failed to authenticate with provided credentials',
    );
  }
}

const isNonEmptyString = (s: any) => typeof s === 'string' && s.length > 0;

// log validation errors as info, probably user error because my code never has bugs.
async function isConfigurationValid(
  logger: IntegrationExecutionContext['logger'],
  config: any,
) {
  const { username, account, password, role } = config;

  const validConfigFields =
    isNonEmptyString(username) &&
    isNonEmptyString(account) &&
    isNonEmptyString(password) &&
    isNonEmptyString(role);
  if (!validConfigFields) {
    logger.info(
      'Integration configuration fields are not valid, username, account and password are required to be non-empty strings.',
    );
    return false;
  }
  try {
    const client = await createClient({
      username,
      account,
      password,
      role,
      logger,
    });
    await client.destroy();
  } catch (error) {
    logger.info({ error }, 'Failed to create client with error.');
    return false;
  }
  return true;
}
