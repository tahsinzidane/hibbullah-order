export type CustomerRecord = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  status: "active" | "inactive";
  orderCount: number;
  totalSpent: number;
  dueAmount: number;
};