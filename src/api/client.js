// src/api/client.js
import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: { 'x-api-key': import.meta.env.VITE_MASTER_KEY || 'vynox-master-2026' },
  timeout: 10000,
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('[VYNOX API]', err.response?.data?.error || err.message);
    return Promise.reject(err);
  }
);

export const api = {
  // Sites
  getSites:       ()       => client.get('/api/sites'),
  getSite:        (id)     => client.get(`/api/sites/${id}`),
  registerSite:   (data)   => client.post('/api/sites/register', data),
  updateSite:     (id, d)  => client.put(`/api/sites/${id}`, d),
  deleteSite:     (id)     => client.delete(`/api/sites/${id}`),

  // Alerts
  getAlerts:      (params) => client.get('/api/alerts', { params }),
  getSiteAlerts:  (id, p)  => client.get(`/api/alerts/site/${id}`, { params: p }),
  resolveAlert:   (id)     => client.put(`/api/alerts/${id}/resolve`),
  deleteAlert:    (id)     => client.delete(`/api/alerts/${id}`),

  // Checksums
  getSiteChecksums: (id, p) => client.get(`/api/checksums/${id}`, { params: p }),

  // Blocked IPs
  getBlockedIps:  (p)      => client.get('/api/blocked-ips', { params: p }),
  blockIp:        (data)   => client.post('/api/blocked-ips', data),
  unblockIp:      (ip)     => client.delete(`/api/blocked-ips/${ip}`),

  // Scan Logs
  getScanLogs:    (id, p)  => client.get(`/api/scan-logs/${id}`, { params: p }),
  getAllScanLogs:  ()       => client.get('/api/scan-logs'),

  // Backups
  getBackups:     (id)     => client.get(`/api/backups/${id}`),

  // Products
  getProducts:    (id, p)  => client.get(`/api/products/${id}`, { params: p }),

  // Scan trigger
  triggerScan:    (id, scanType) => client.post(`/api/scan/${id}`, { scanType }),

  // Ping
  ping:           ()       => client.get('/api/ping'),
};

export default client;
