export type PlatformRole = "founder" | "expert" | "admin";

export type ExpertApplicationStatus = "pending" | "approved" | "rejected";

export type ReviewRequestStatus = "pending" | "assigned" | "closed";

export type ReviewAssignmentStatus = "active" | "completed";

export type ExpertApplication = {
  id: string;
  user_id: string;
  full_name: string;
  company: string;
  cv_path: string | null;
  status: ExpertApplicationStatus;
  reviewed_at: string | null;
  reviewed_by: string | null;
  founder_continued_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ReviewRequest = {
  id: string;
  founder_id: string;
  note: string | null;
  status: ReviewRequestStatus;
  created_at: string;
  updated_at: string;
};

export type ReviewAssignment = {
  id: string;
  request_id: string;
  founder_id: string;
  expert_id: string;
  status: ReviewAssignmentStatus;
  created_at: string;
  updated_at: string;
};

export type ReviewMessage = {
  id: string;
  assignment_id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

export const BOOTSTRAP_ADMIN_EMAIL = "thishuarnav@gmail.com";
