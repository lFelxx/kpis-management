import { AppInfoRepository } from '../../core/interfaces/repositories/AppInfoRepository';
import { request } from './apiClient';

export class AppInfoApiRepository implements AppInfoRepository {
  constructor(private readonly baseUrl: string) {}

  async getVersion(): Promise<string> {
    const response = await request(`${this.baseUrl}/app/info`, {}, { requireAuth: true });
    if (!response.ok) throw new Error('Error al obtener la versión de la aplicación');
    const data: { version: string } = await response.json();
    return data.version;
  }
}
