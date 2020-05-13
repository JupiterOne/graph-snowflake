import { IntegrationInstanceConfigFieldMap } from '@jupiterone/integration-sdk';

const instanceConfigFields: IntegrationInstanceConfigFieldMap = {
  username: {
    type: 'string',
  },
  account: {
    type: 'string',
  },
  password: {
    type: 'string',
    mask: true,
  },
  role: {
    type: 'string',
  },
};

export default instanceConfigFields;
