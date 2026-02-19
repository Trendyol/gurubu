import axios from "axios";

export class PresentationService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getTemplates() {
    try {
      const response = await axios.get(`${this.baseUrl}/presentation/templates`);
      return response.data;
    } catch (error) {
      console.error("Error fetching templates:", error);
      return [];
    }
  }

  async createPresentation(payload: { 
    nickName: string; 
    title?: string; 
    templateId?: string; 
    retentionDays?: number;
    isPermanent?: boolean;
  }) {
    try {
      const response = await axios.post(`${this.baseUrl}/presentation/create`, payload);
      return response.data;
    } catch (error) {
      console.error("Error creating presentation:", error);
      return null;
    }
  }

  async joinPresentation(presentationId: string, payload: { nickName: string; isViewer?: boolean }) {
    try {
      const response = await axios.post(`${this.baseUrl}/presentation/${presentationId}`, payload);
      return response.data;
    } catch (error) {
      console.error("Error joining presentation:", error);
      return null;
    }
  }

  async getPresentation(presentationId: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/presentation/${presentationId}`);
      return response.data;
    } catch (error) {
      console.error("Error getting presentation:", error);
      return null;
    }
  }

  async checkPresentationBatch(presentationIds: string[]): Promise<{
    existingIds: string[];
    participants: Record<string, Array<{ nickname: string; avatarSeed: string; isViewer: boolean }>>;
  }> {
    try {
      const response = await axios.post(`${this.baseUrl}/presentation/check-batch`, { presentationIds });
      return {
        existingIds: response.data.existingIds || [],
        participants: response.data.participants || {},
      };
    } catch {
      return { existingIds: [], participants: {} };
    }
  }
}
