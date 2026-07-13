export interface ArticleData {
  title: string;
  description: string;
  body: string;
  tagList: string[];
}

export interface Article extends ArticleData {
  slug: string;
  createdAt: string;
  updatedAt: string;
  favorited?: boolean;
  favoritesCount?: number;
}

export interface ArticleResponse {
  article: Article;
}

export interface ArticlesResponse {
  articles: Article[];
  articlesCount: number;
}
