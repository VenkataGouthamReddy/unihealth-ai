export type UserRole = 'student' | 'doctor' | 'admin';

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface UserVitals {
  blood_pressure?: string;
  pulse?: number;
  temperature?: number;
  weight?: number;
  recorded_at?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  profile_picture?: string | null;
  phone?: string;
  student_id?: string;
  department?: string;
  blood_group?: string;
  allergies?: string[];
  medical_history?: string[];
  emergency_contact?: EmergencyContact;
  vitals?: UserVitals;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience_years: number;
  rating: number;
  consultation_fee: number;
  available_days: string[];
  image_url?: string;
  bio?: string;
  is_approved?: boolean;
  qualification?: string;
}

export interface Appointment {
  id: string;
  student_id: string;
  student_name: string;
  doctor_id: string;
  doctor_name: string;
  doctor_specialty: string;
  appointment_date: string;
  time_slot: string;
  symptoms: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
}

export interface PrescriptionMedicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface Prescription {
  id: string;
  appointment_id?: string;
  student_id: string;
  student_name: string;
  doctor_id: string;
  doctor_name: string;
  diagnosis: string;
  medicines: PrescriptionMedicine[];
  notes?: string;
  date: string;
}

export interface ReminderItem {
  id: string;
  title: string;
  time: string;
  type: 'medicine' | 'checkup' | 'vitals' | 'water';
  dosage?: string;
  frequency: string;
  enabled: boolean;
}

export interface AuditLogItem {
  id: string;
  action: string;
  performed_by: string;
  target_user?: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error';
  ip_address?: string;
}

export interface AiChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface SymptomCheckRequest {
  symptoms: string[];
  duration: string;
  severity: 'mild' | 'moderate' | 'severe';
  additional_notes?: string;
}

export interface SymptomCheckResponse {
  possible_conditions: string[];
  urgency_level: 'low' | 'medium' | 'high' | 'emergency';
  recommended_specialties: string[];
  self_care_tips: string[];
  disclaimer: string;
}

export interface HealthRecord {
  id: string;
  title: string;
  type: 'prescription' | 'lab_report' | 'vaccination' | 'checkup';
  date: string;
  doctor_name?: string;
  file_url?: string;
  summary?: string;
  details?: any;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'appointment' | 'alert' | 'general' | 'reminder';
  date: string;
  read: boolean;
}
