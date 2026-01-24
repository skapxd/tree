export const API_URL = 'https://api.example.com';

export type User = {
  id: string;
  name: string;
};

export class UserService {
  private cache = new Map();

  async getUser(id: string): Promise<User> {
    return { id, name: 'Test' };
  }
}

function helper() {
  return true;
}
