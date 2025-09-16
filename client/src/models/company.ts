export interface Company {
  id: number;
  email: string;
  companyName: string;
  password: string;
}

export interface Companies {
  users: Company[];
}
