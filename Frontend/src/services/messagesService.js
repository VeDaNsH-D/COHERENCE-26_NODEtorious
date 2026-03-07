import apiService from './api';
import { API_ENDPOINTS } from '../config/api';

export const messagesService = {
  async generateMessage(payload) {
    return apiService.post(API_ENDPOINTS.MESSAGES.GENERATE, payload);
  },

  async sendEmail(payload) {
    return apiService.post(API_ENDPOINTS.MESSAGES.SEND_EMAIL, payload);
  },
};

export default messagesService;
