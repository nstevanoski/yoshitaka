import { Role } from './role';

export class User {
  id: number;
  email: string;
  name: string;
  password: string;
  firstName: string;
  lastName: string;
  avatar: string;
  role: Role;
  token?: string;
  accessToken: string;
}
