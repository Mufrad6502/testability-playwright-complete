export interface UserSettings {
  email?: string;
  username?: string;
  password?: string;
  image?: string;
  bio?: string;
}

export interface User {
  email: string;
  username: string;
  bio: string | null;
  image: string | null;
  token?: string;
}

export interface UserResponse {
  user: User;
}
