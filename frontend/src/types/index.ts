// User types
export interface User {
  id: number;
  email: string;
  name: string;
  bio?: string;
  avatarUrl?: string;
  location?: string;
  phone?: string;
  skills?: string[];
  role?: 'USER' | 'ADMIN';
  rating?: number;
  reviewCount?: number;
  completedTasks?: number;
  emailVerified?: boolean;
  createdAt?: string;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  location?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// Category types
export interface Category {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  slug?: string;
  imageUrl?: string;
  parentId?: number;
  subcategories?: Category[];
}

// Task types
export type TaskStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type LocationType = 'IN_PERSON' | 'REMOTE';

export interface Task {
  id: number;
  poster: User;
  title: string;
  description: string;
  budgetMin?: number;
  budgetMax?: number;
  location?: string;
  latitude?: number;
  longitude?: number;
  locationType?: LocationType;
  category?: Category;
  status: TaskStatus;
  dueDate?: string;
  flexible?: boolean;
  images?: string[];
  assignedTasker?: User;
  agreedPrice?: number;
  offerCount?: number;
  createdAt: string;
  assignedAt?: string;
  completedAt?: string;
}

export interface TaskCreateRequest {
  title: string;
  description: string;
  budgetMin?: number;
  budgetMax?: number;
  location?: string;
  latitude?: number;
  longitude?: number;
  locationType?: LocationType;
  categoryId: number;
  dueDate?: string;
  flexible?: boolean;
  images?: string[];
}

export interface TaskFilters {
  status?: TaskStatus;
  categoryId?: number;
  minBudget?: number;
  maxBudget?: number;
  location?: string;
  search?: string;
  page?: number;
  size?: number;
}

// Offer types
export type OfferStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';

export interface Offer {
  id: number;
  taskId: number;
  tasker: User;
  price: number;
  message?: string;
  estimatedHours?: number;
  status: OfferStatus;
  createdAt: string;
}

export interface OfferCreateRequest {
  price: number;
  message?: string;
  estimatedHours?: number;
}

// Message types
export interface Message {
  id: number;
  taskId: number;
  sender: User;
  receiver: User;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface MessageCreateRequest {
  receiverId: number;
  content: string;
}

// Review types
export type ReviewType = 'POSTER_TO_TASKER' | 'TASKER_TO_POSTER';

export interface Review {
  id: number;
  taskId: number;
  reviewer: User;
  reviewee: User;
  rating: number;
  comment?: string;
  type: ReviewType;
  createdAt: string;
}

export interface ReviewCreateRequest {
  rating: number;
  comment?: string;
}

// Notification types
export type NotificationType =
  | 'NEW_OFFER'
  | 'OFFER_ACCEPTED'
  | 'OFFER_REJECTED'
  | 'NEW_MESSAGE'
  | 'TASK_ASSIGNED'
  | 'TASK_COMPLETED'
  | 'NEW_REVIEW'
  | 'PAYMENT_RECEIVED'
  | 'SYSTEM';

export type ReferenceType = 'TASK' | 'OFFER' | 'MESSAGE' | 'REVIEW' | 'PAYMENT';

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message?: string;
  read: boolean;
  referenceId?: number;
  referenceType?: ReferenceType;
  createdAt: string;
}

// Payment types
export type PaymentStatus = 'PENDING' | 'HELD' | 'COMPLETED' | 'REFUNDED' | 'FAILED';

export interface Payment {
  id: number;
  taskId: number;
  payer: User;
  payee: User;
  amount: number;
  platformFee?: number;
  netAmount?: number;
  status: PaymentStatus;
  transactionId?: string;
  description?: string;
  createdAt: string;
  completedAt?: string;
}

// Pagination
export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
