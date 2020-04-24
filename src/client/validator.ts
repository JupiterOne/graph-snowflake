import Ajv from 'ajv';
import * as schemas from './__generated__/schemas/index.json';

const ajv = new Ajv();
ajv.addSchema(schemas);
export default ajv;
