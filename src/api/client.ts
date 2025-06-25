import axios from 'axios';
import { api as baseUrl } from './baseUrl';

export const api = axios.create({
  baseURL: baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});
