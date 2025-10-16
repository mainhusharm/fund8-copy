import MetaApi from 'metaapi.cloud-sdk';
import dotenv from 'dotenv';

dotenv.config();

const token = process.env.METAAPI_TOKEN;

if (!token) {
  throw new Error('MetaAPI token is required');
}

const api = new MetaApi(token);

export default api;
