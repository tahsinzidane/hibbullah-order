export type User = {
  id: string;
  name: string;
  email?: string;
  phone: string;
  role: "customer" | "admin";
  avatar?: string;
  createdAt: string;
};

export type UserProfile = {
  id: string;
  fullName: string | null;
  phoneNumber: string | null;
  email?: string | null;
  role?: "customer" | "admin";
  avatar?: string;
  createdAt?: string | null;
};

export type UpdateUserProfileInput = {
  fullName: string;
  phoneNumber: string;
  email?: string;
};

export type RequiredProfileField = "full_name" | "phone_number";

