import { HttpService } from "./axios";
const api = HttpService.getInstance();

import type {
  Student,
  Dorm,
  Room,
  Application,
  Payment,
  Pagination,
  ApplicationStatus,
} from "../models/housing";

// ------- Students -------
export async function listStudents(q = "", page = 1, pageSize = 10) {
  const data = await api.get<Pagination<Student>>(
    "/student-housing/api/students",
    {
      name: q,
      page,
      pageSize,
    }
  );
  // backend shape: { students, pagination }
  return { rows: data.students ?? [], pagination: data.pagination };
}
export async function createStudent(payload: Omit<Student, "id">) {
  const data = await api.post<Student, Omit<Student, "id">>(
    "/student-housing/api/students",
    payload
  );
  return data;
}
export async function deleteStudent(id: string) {
  await api.delete(`/student-housing/api/students/${id}`);
}

// ------- Dorms -------
export async function listDorms(page = 1, pageSize = 10) {
  const data = await api.get<Pagination<Dorm>>("/student-housing/api/dorms", {
    page,
    pageSize,
  });
  return { rows: data.items ?? [], pagination: data.pagination };
}
export async function createDorm(payload: Omit<Dorm, "id">) {
  const data = await api.post<Dorm, Omit<Dorm, "id">>(
    "/student-housing/api/dorms",
    payload
  );
  return data;
}
export async function deleteDorm(id: string) {
  await api.delete(`/student-housing/api/dorms/${id}`);
}

// ------- Rooms -------
export async function listRooms(
  params: { dormId?: string; page?: number; pageSize?: number } = {}
) {
  const { dormId = "", page = 1, pageSize = 10 } = params;
  const data = await api.get<Pagination<Room>>("/student-housing/api/rooms", {
    dormId,
    page,
    pageSize,
  });
  return { rows: data.items ?? [], pagination: data.pagination };
}
export async function createRoom(payload: Omit<Room, "id">) {
  const data = await api.post<Room, Omit<Room, "id">>(
    "/student-housing/api/rooms",
    payload
  );
  return data;
}
export async function deleteRoom(id: string) {
  await api.delete(`/student-housing/api/rooms/${id}`);
}

// ------- Applications -------
export async function listApplications(
  params: {
    studentId?: string;
    dormId?: string;
    status?: ApplicationStatus;
    page?: number;
    pageSize?: number;
  } = {}
) {
  const data = await api.get<Pagination<Application>>(
    "/student-housing/api/applications",
    params
  );
  return { rows: data.items ?? [], pagination: data.pagination };
}
export async function createApplication(payload: Omit<Application, "id">) {
  const data = await api.post<Application, Omit<Application, "id">>(
    "/student-housing/api/applications",
    payload
  );
  return data;
}
export async function updateApplication(
  id: string,
  payload: Partial<Pick<Application, "points" | "status" | "roomId">>
) {
  const data = await api.put<
    Application,
    Partial<Pick<Application, "points" | "status" | "roomId">>
  >(`/student-housing/api/applications/${id}`, payload);
  return data;
}
export async function deleteApplication(id: string) {
  await api.delete(`/student-housing/api/applications/${id}`);
}

// ------- Payments -------
export async function listPayments(
  params: { applicationId?: string; page?: number; pageSize?: number } = {}
) {
  const data = await api.get<Pagination<Payment>>(
    "/student-housing/api/payments",
    params
  );
  return { rows: data.items ?? [], pagination: data.pagination };
}
export async function createPayment(payload: Omit<Payment, "id" | "issuedAt">) {
  const data = await api.post<Payment, Omit<Payment, "id" | "issuedAt">>(
    "/student-housing/api/payments",
    payload
  );
  return data;
}
export async function deletePayment(id: string) {
  await api.delete(`/student-housing/api/payments/${id}`);
}
