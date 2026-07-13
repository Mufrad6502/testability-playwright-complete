import { faker } from '@faker-js/faker';
import type { ArticleData } from '@models/article';

export function buildArticle(overrides: Partial<ArticleData> = {}): ArticleData {
  const unique = `${Date.now()}-${faker.string.alphanumeric(6).toLowerCase()}`;
  return {
    title: `QA Automation ${unique}`,
    description: faker.lorem.sentence(),
    body: `${faker.lorem.paragraphs(2)}\n\nTest run: ${unique}`,
    tagList: [`qa-${faker.string.alpha({ length: 5 }).toLowerCase()}`],
    ...overrides,
  };
}

export function buildProfileUpdate(): { bio: string; image: string } {
  return {
    bio: `Senior QA automation profile ${Date.now()}`,
    image: `https://api.dicebear.com/9.x/initials/svg?seed=QA-${Date.now()}`,
  };
}
