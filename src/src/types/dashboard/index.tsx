export interface DashboardStats {
  pendingApproval: number;
  totalClasses: number;
  totalStudents: number;
  totalTeachers?: number; // Admin Only
  approvedItems?: number; // Pengajar Only
}

export interface ActivityData {
  day: string;
  count: number;
}

export interface ApprovalItem {
  id: string | number;
  name: string;
  context: string; 
  avatar?: string;
}

export interface ActiveClass {
  id: string | number;
  no: number;
  className: string;
  courseName?: string;
  teacherName: string;
  studentCount: number;
  progress: number;
  status: string;
}
