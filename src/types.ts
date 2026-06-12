export type UserRole = 'admin' | 'dept' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  username?: string;
  password?: string;
  department?: string; // Only populated if role is 'dept'
}

export interface MediaItem {
  id: string;
  title: string;
  type: 'image' | 'video';
  url: string; // Blob URL or path
  size: string; // Formatted size, e.g. "1.5 MB", "1.2 GB"
  department: string;
  uploadedBy: string; // User name
  uploadedAt: string; // ISO string or formatted date
  duration?: number; // Custom image duration in seconds
  scheduleStart?: string; // ISO datetime string or date
  scheduleEnd?: string; // ISO datetime string or date
}

