export interface Appointment {
  id: number;
  startTime: string; // ISO bez Z: "YYYY-MM-DDTHH:MM:SS"
  endTime: string; // ISO bez Z
  treatmentId: number;
  userId: number;
}

export type Appointments = Appointment[] | { appointments: Appointment[] };
