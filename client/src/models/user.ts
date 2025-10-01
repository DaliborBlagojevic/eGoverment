export interface User {
  id: number;
  name: string;
  phone: string;
  companyId: number;
}

export type Role =
  | "STUDENT"
  | "ADMIN"
  | "STAFF";

export interface Users {
  users: User[];
}
