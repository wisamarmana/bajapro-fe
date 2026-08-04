// 0: Pending, 1: Accepted, 2: Rejected
export type ApprovalStatus = 0 | 1 | 2;

export interface TeacherRecord {
  key: string;
  no: number;
  nama: string;
  email: string;
  instansi: string;
  nip: string;
  is_approved_by_admin: ApprovalStatus;
}