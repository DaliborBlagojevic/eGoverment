export type ApplicationStatus =
  | "SUBMITTED"
  | "ACCEPTED"
  | "REJECTED"
  | "RESERVED";

export type Student = {
  id: number;
  index: string;
  firstName: string;
  lastName: string;
  faculty: string;
  email: string;
};

export type Dorm = {
  id: string;
  name: string;
  address: string;
};

export type Room = {
  id: string;
  number: string;
  capacity: number;
  available: boolean;
  dormId: string;
};

export type Application = {
  id: string;
  points: number;
  status: ApplicationStatus;
  studentId: number;
  roomId?: string | null;
};

export type Payment = {
  id: string;
  reference: string;
  amount: number;
  issuedAt: string;
  applicationId: string;
};

export type Pagination<T> = {
  items?: T[];
  students?: Student[];
  pagination: { page: number; pageSize: number; totalCount: number };
};
