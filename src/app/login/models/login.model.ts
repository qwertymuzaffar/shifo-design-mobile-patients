import { UserRole } from "@core/models/user.model";

export interface Login {
  user: User;
  access_token: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: {
    createdAt: string;
    description: string;
    id: number;
    name: string;
    slug: UserRole;
    updatedAt: string;
  };
}
