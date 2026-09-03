export interface TeacherRecord {
  key: string;
  no: number;
  nama: string;
  email: string;
  instansi: string;
  nip: string;
  approval: number;
}

export type UpdateApprovalDto = {
    approval: number; // 0: Pending, 1: Accepted, 2: Rejected
}