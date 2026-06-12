export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  age: number;
  address: string;
  join_date: string;
  expiry_date: string;
  status: 'active' | 'inactive';
  plan_id: string | null;
  plan_name?: string;
  price?: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  term: string;
  price: number;
  features: string[];
  active: boolean;
  created_at?: string;
}

export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  monthlyRevenue: number;
  revenueByMonth: { month: string; amount: number }[];
  membersByGender: { gender: string; count: number }[];
  membershipDistribution: { name: string; value: number }[];
}

export interface AuthResponse {
  user: User;
  token: string;
}
