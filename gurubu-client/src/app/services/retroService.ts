import axios from "axios";

export class RetroService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getTemplates() {
    try {
      const response = await axios.get(`${this.baseUrl}/retro/templates`);
      return response.data;
    } catch (error) {
      console.error("Error fetching templates:", error);
      return [];
    }
  }

  async createRetro(payload: { nickName: string; title?: string; templateId?: string }) {
    try {
      const response = await axios.post(`${this.baseUrl}/retro/create`, payload);
      return response.data;
    } catch (error) {
      console.error("Error creating retro:", error);
      return null;
    }
  }

  async joinRetro(retroId: string, payload: { nickName: string }) {
    try {
      const response = await axios.post(`${this.baseUrl}/retro/${retroId}`, payload);
      return response.data;
    } catch (error) {
      console.error("Error joining retro:", error);
      return null;
    }
  }

  async getRetro(retroId: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/retro/${retroId}`);
      return response.data;
    } catch (error) {
      console.error("Error getting retro:", error);
      return null;
    }
  }
}
