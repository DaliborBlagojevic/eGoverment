export interface Treatment {
  id: number;
  name: string;
  duration: string; // UI drži kao string (npr. "30 min")
  companyId: number;
}

export interface Treatments {
  treatments: Treatment[];
}
