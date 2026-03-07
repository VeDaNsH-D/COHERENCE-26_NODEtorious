import apiService from './api';
import { API_ENDPOINTS } from '../config/api';

export const analyticsService = {
  async getCampaignAnalytics(workflowId) {
    const endpoint = workflowId
      ? `${API_ENDPOINTS.ANALYTICS.CAMPAIGN}?workflowId=${encodeURIComponent(workflowId)}`
      : API_ENDPOINTS.ANALYTICS.CAMPAIGN;

    return apiService.get(endpoint);
  },
  async getChartData() {
    return apiService.get(API_ENDPOINTS.ANALYTICS.CHART_DATA);
  },
};

export default analyticsService;
