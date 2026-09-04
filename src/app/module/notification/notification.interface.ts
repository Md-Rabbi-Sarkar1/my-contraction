export interface NotificationListFilters {
  userId: string;
  page: number;
  pageSize: number;
  unreadOnly?: boolean | undefined;
}