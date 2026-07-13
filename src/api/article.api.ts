import type { APIRequestContext } from '@playwright/test';
import type { ArticleData, ArticleResponse, ArticlesResponse } from '@models/article';

export class ArticleApi {
  public constructor(
    private readonly request: APIRequestContext,
    private readonly apiUrl: string,
    private readonly token: string,
  ) {}

  private headers(): Record<string, string> {
    return { Authorization: `Token ${this.token}`, 'Content-Type': 'application/json' };
  }

  async create(data: ArticleData): Promise<ArticleResponse> {
    const response = await this.request.post(`${this.apiUrl}/articles`, {
      headers: this.headers(),
      data: { article: data },
    });
    if (response.status() !== 201) {
      throw new Error(`Create article failed: ${response.status()} ${await response.text()}`);
    }
    return (await response.json()) as ArticleResponse;
  }

  async get(slug: string): Promise<ArticleResponse> {
    const response = await this.request.get(`${this.apiUrl}/articles/${slug}`, {
      headers: this.headers(),
    });
    if (!response.ok()) {
      throw new Error(`Get article failed: ${response.status()} ${await response.text()}`);
    }
    return (await response.json()) as ArticleResponse;
  }

  async listByTag(tag: string): Promise<ArticlesResponse> {
    const response = await this.request.get(`${this.apiUrl}/articles`, {
      headers: this.headers(),
      params: { tag, limit: 100, offset: 0 },
    });
    if (!response.ok()) {
      throw new Error(`List articles failed: ${response.status()} ${await response.text()}`);
    }
    return (await response.json()) as ArticlesResponse;
  }

  async delete(slug: string): Promise<void> {
    const response = await this.request.delete(`${this.apiUrl}/articles/${slug}`, {
      headers: this.headers(),
    });
    if (![200, 204].includes(response.status())) {
      throw new Error(`Delete article failed: ${response.status()} ${await response.text()}`);
    }
  }

  async status(slug: string): Promise<number> {
    return (
      await this.request.get(`${this.apiUrl}/articles/${slug}`, { headers: this.headers() })
    ).status();
  }

  async tryDelete(slug: string): Promise<number> {
    return (
      await this.request.delete(`${this.apiUrl}/articles/${slug}`, { headers: this.headers() })
    ).status();
  }
}
