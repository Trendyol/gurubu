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

  async createRetro(payload: { nickName: string; title?: string; templateId?: string; retentionDays?: number; customColumns?: string[] }) {
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
    const response = await axios.get(`${this.baseUrl}/retro/${retroId}`);
    return response.data;
  }

  async checkRetroBatch(retroIds: string[]): Promise<{
    existingIds: string[];
    participants: Record<string, Array<{ nickname: string; avatarSeed: string; isAfk: boolean }>>;
  }> {
    try {
      const response = await axios.post(`${this.baseUrl}/retro/check-batch`, { retroIds });
      return {
        existingIds: response.data.existingIds || [],
        participants: response.data.participants || {},
      };
    } catch {
      return { existingIds: [], participants: {} };
    }
  }
}
