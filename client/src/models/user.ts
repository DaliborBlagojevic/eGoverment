export interface User {
  id: number;
  name: string;
  phone: string;
  companyId: number;
}

export interface Users {
  users: User[];
}
