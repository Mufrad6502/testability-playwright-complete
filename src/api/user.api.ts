import type { APIRequestContext } from '@playwright/test';
import type { UserResponse, UserSettings } from '@models/user';

export class UserApi {
  public constructor(
    private readonly request: APIRequestContext,
    private readonly apiUrl: string,
    private readonly token: string,
  ) {}

  private headers(): Record<string, string> {
    return { Authorization: `Token ${this.token}`, 'Content-Type': 'application/json' };
  }

  async getCurrent(): Promise<UserResponse> {
    const response = await this.request.get(`${this.apiUrl}/user`, { headers: this.headers() });
    if (!response.ok()) {
      throw new Error(`Get current user failed: ${response.status()} ${await response.text()}`);
    }
    return (await response.json()) as UserResponse;
  }

  async update(settings: UserSettings): Promise<UserResponse> {
    const response = await this.request.put(`${this.apiUrl}/user`, {
      headers: this.headers(),
      data: { user: settings },
    });
    if (!response.ok()) {
      throw new Error(`Update user failed: ${response.status()} ${await response.text()}`);
    }
    return (await response.json()) as UserResponse;
  }
}
