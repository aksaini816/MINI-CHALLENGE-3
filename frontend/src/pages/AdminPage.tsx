import React, { useEffect, useState } from 'react';
import { Shield, Users, BookOpen, Trophy, BarChart3, UserCheck, UserX } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, Input, Skeleton } from '@/components/ui';
import api from '@/lib/api';
import { formatDate, formatNumber } from '@/lib/utils';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface Analytics {
  totalUsers: number;
  activeUsers: number;
  totalEntries: number;
  totalGoals: number;
  totalChallengesCompleted: number;
  avgMonthlyEmissions: number;
  avgSustainabilityScore: number;
}

export function AdminPage(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'content'>('analytics');
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async (): Promise<void> => {
    const res = await api.get('/admin/analytics');
    setAnalytics(res.data.data);
  };

  const fetchUsers = async (): Promise<void> => {
    const params = userSearch ? `?search=${encodeURIComponent(userSearch)}` : '';
    const res = await api.get(`/admin/users${params}`);
    setUsers(res.data.data.users ?? []);
  };

  useEffect(() => {
    const init = async (): Promise<void> => {
      setLoading(true);
      try {
        await Promise.all([fetchAnalytics(), fetchUsers()]);
      } catch { /* empty */ }
      finally { setLoading(false); }
    };
    void init();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => void fetchUsers(), 400);
    return () => clearTimeout(t);
  }, [userSearch]);

  const toggleUserStatus = async (userId: string, isActive: boolean): Promise<void> => {
    await api.put(`/admin/users/${userId}`, { isActive: !isActive });
    await fetchUsers();
  };

  return (
    <Layout title="Admin Panel">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" aria-hidden="true" />
            Admin Panel
          </h2>
          <p className="text-muted-foreground text-sm mt-1">Manage users, content, and platform analytics</p>
        </div>

        {/* Tabs */}
        <div role="tablist" aria-label="Admin sections" className="flex border-b border-border gap-4">
          {[
            { key: 'analytics' as const, label: 'Analytics', icon: BarChart3 },
            { key: 'users' as const, label: 'Users', icon: Users },
            { key: 'content' as const, label: 'Content', icon: BookOpen },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              role="tab"
              aria-selected={activeTab === key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 pb-3 text-sm font-medium border-b-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-t
                ${activeTab === key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" aria-busy="true">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : (
          <>
            {/* Analytics Tab */}
            {activeTab === 'analytics' && analytics && (
              <div className="space-y-6" role="tabpanel" aria-label="Analytics overview">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Users', value: analytics.totalUsers, icon: Users },
                    { label: 'Active Users', value: analytics.activeUsers, icon: UserCheck },
                    { label: 'Calculations', value: analytics.totalEntries, icon: BarChart3 },
                    { label: 'Goals Created', value: analytics.totalGoals, icon: Trophy },
                  ].map(({ label, value, icon: Icon }) => (
                    <Card key={label}>
                      <CardContent className="pt-5">
                        <Icon className="h-5 w-5 text-primary mb-2" aria-hidden="true" />
                        <div className="text-2xl font-bold">{value}</div>
                        <div className="text-xs text-muted-foreground">{label}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-5 text-center">
                      <div className="text-3xl font-bold text-primary">{formatNumber(analytics.avgMonthlyEmissions)}</div>
                      <div className="text-xs text-muted-foreground mt-1">Avg Monthly Emissions (kg CO₂)</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-5 text-center">
                      <div className="text-3xl font-bold text-green-600">{analytics.avgSustainabilityScore}</div>
                      <div className="text-xs text-muted-foreground mt-1">Avg Sustainability Score</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-5 text-center">
                      <div className="text-3xl font-bold text-blue-600">{analytics.totalChallengesCompleted}</div>
                      <div className="text-xs text-muted-foreground mt-1">Challenges Completed</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-4" role="tabpanel" aria-label="User management">
                <Input
                  type="search"
                  placeholder="Search users by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  aria-label="Search users"
                />
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-sm" aria-label="Users table">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground" scope="col">User</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground" scope="col">Role</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground" scope="col">Status</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground" scope="col">Joined</th>
                        <th className="px-4 py-3 text-left font-medium text-muted-foreground" scope="col">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-border hover:bg-muted/30">
                          <td className="px-4 py-3">
                            <div className="font-medium">{user.name}</div>
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                              user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300' : 'bg-muted text-muted-foreground'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                              user.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                            }`}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(user.createdAt)}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => void toggleUserStatus(user.id, user.isActive)}
                              className={`text-xs px-2 py-1 rounded border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                                ${user.isActive
                                  ? 'border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400'
                                  : 'border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400'}`}
                              aria-label={`${user.isActive ? 'Deactivate' : 'Activate'} user ${user.name}`}
                            >
                              {user.isActive ? (
                                <><UserX className="h-3 w-3 inline mr-0.5" />Deactivate</>
                              ) : (
                                <><UserCheck className="h-3 w-3 inline mr-0.5" />Activate</>
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Content Tab */}
            {activeTab === 'content' && (
              <div role="tabpanel" aria-label="Content management" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card className="border-dashed">
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <BookOpen className="h-4 w-4" aria-hidden="true" />
                        Articles
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">Manage knowledge hub articles. Use the API to create, update, or delete articles.</p>
                      <div className="text-xs bg-muted rounded-lg p-3 font-mono">
                        POST /api/admin/articles<br />
                        PUT /api/admin/articles/:id<br />
                        DELETE /api/admin/articles/:id
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-dashed">
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Trophy className="h-4 w-4" aria-hidden="true" />
                        Challenges
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">Manage sustainability challenges and gamification content.</p>
                      <div className="text-xs bg-muted rounded-lg p-3 font-mono">
                        GET /api/admin/challenges<br />
                        POST /api/admin/challenges
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
