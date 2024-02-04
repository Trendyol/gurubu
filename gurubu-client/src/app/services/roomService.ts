import axios from "axios";
import { HTTP_STATUS } from "@/shared/enums";

export class RoomService {
  baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async createRoom(payload: CreateRoomPayload) {
    const url = `${this.baseUrl}/room/create`;

    try {
      const response = await axios.post(url, payload);
      if (response.status === HTTP_STATUS.CREATED) return response.data;

      return null;
    } catch (e) {
      return null;
    }
  }

  async getRoom(id: string) {
    const url = `${this.baseUrl}/room/${id}`;
    try {
      const response = await axios.get(url);
      return { isSuccess: true };
    } catch (e) {
      return { isSuccess: false };
    }
  }

  async join(id: string, payload: joinRoomPayload) {
    const url = `${this.baseUrl}/room/${id}`;
    try {
      const response = await axios.post(url, payload);
      if (response.status === HTTP_STATUS.OK) return response.data;

      return null;
    } catch (e) {
      return null;
    }
  }
}

interface CreateRoomPayload {
  nickName: string;
}

interface joinRoomPayload {
  nickName: string;
}
