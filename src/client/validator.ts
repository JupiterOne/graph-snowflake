import Ajv from 'ajv';
import * as schemas from './schemas/index.json';

const ajv = new Ajv();
ajv.addSchema(schemas);
export default ajv;
