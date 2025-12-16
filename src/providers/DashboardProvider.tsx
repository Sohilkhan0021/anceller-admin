import { createContext, useContext, PropsWithChildren } from "react";
import axios from "axios";
import { useQuery } from "react-query";

const API_URL = import.meta.env.VITE_APP_API_URL;

// ROUTES
const DASHBOARD_STATS_URL = `${API_URL}/admin/dashboard/stats`;
const DASHBOARD_BOOKING_TREND_URL = `${API_URL}/admin/dashboard/booking-trend`;
const DASHBOARD_REVENUE_CATEGORY_URL = `${API_URL}/admin/dashboard/revenue-by-category`;
const DASHBOARD_PENDING_APPROVALS_URL = `${API_URL}/admin/dashboard/pending-approvals`;
const DASHBOARD_SETTLEMENT_QUEUE_URL = `${API_URL}/admin/dashboard/settlement-queue`;
const ADMIN_USERS_URL = `${API_URL}/admin/users`;

interface DashboardContextProps {
  useDashboardStats: (period: "today" | "week" | "month") => any;
  useBookingTrend: (days: number) => any;
  useRevenueByCategory: (start_date: string, end_date: string) => any;
  usePendingApprovals: () => any;
  useSettlementQueue: () => any;
  useAdminUsers: (params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) => any;
}

const DashboardContext = createContext<DashboardContextProps | null>(null);

const DashboardProvider = ({ children }: PropsWithChildren) => {

  // DASHBOARD STATS (period required)
  const useDashboardStats = (period: "today" | "week" | "month") =>
    useQuery(
      ["dashboard-stats", period],
      async () => {
        const { data } = await axios.get(DASHBOARD_STATS_URL, {
          params: { period },
        });
        return data;
      },
      { enabled: !!period }
    );

  //  BOOKING TREND (days required)
  const useBookingTrend = (days: number) =>
    useQuery(
      ["dashboard-booking-trend", days],
      async () => {
        const { data } = await axios.get(DASHBOARD_BOOKING_TREND_URL, {
          params: { days },
        });
        return data;
      },
      { enabled: !!days }
    );

  // REVENUE BY CATEGORY (start_date + end_date)
  const useRevenueByCategory = (start_date: string, end_date: string) =>
    useQuery(
      ["dashboard-revenue-category", start_date, end_date],
      async () => {
        const { data } = await axios.get(DASHBOARD_REVENUE_CATEGORY_URL, {
          params: { start_date, end_date },
        });
        return data;
      },
      { enabled: !!start_date && !!end_date }
    );

  //  PENDING APPROVALS (no params)
  const usePendingApprovals = () =>
    useQuery("dashboard-pending-approvals", async () => {
      const { data } = await axios.get(DASHBOARD_PENDING_APPROVALS_URL);
      return data;
    });

  // SETTLEMENT QUEUE (no params)
  const useSettlementQueue = () =>
    useQuery("dashboard-settlement-queue", async () => {
      const { data } = await axios.get(DASHBOARD_SETTLEMENT_QUEUE_URL);
      return data;
    });

  //  ADMIN USERS WITH FILTERS
  const useAdminUsers = ({
    page = 1,
    limit = 10,
    status = "",
    search = "",
  }) =>
    useQuery(
      ["admin-users", page, limit, status, search],
      async () => {
        const { data } = await axios.get(ADMIN_USERS_URL, {
          params: { page, limit, status, search },
        });
        return data;
      },
      { keepPreviousData: true }
    );

  return (
    <DashboardContext.Provider
      value={{
        useDashboardStats,
        useBookingTrend,
        useRevenueByCategory,
        usePendingApprovals,
        useSettlementQueue,
        useAdminUsers,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used inside DashboardProvider");
  }
  return context;
};

export { DashboardProvider, useDashboard };
