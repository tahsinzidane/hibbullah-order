export type NotificationType = "info" | "success" | "warning" | "alert";

export type NotificationItem = {
  id: string;
  userId?: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  type: NotificationType;
};