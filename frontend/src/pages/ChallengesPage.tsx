import React, { useEffect, useState } from 'react';
import { Trophy, Zap, Target, CheckCircle2, Plus, Star } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button, Progress, Skeleton } from '@/components/ui';
import api from '@/lib/api';
import { getApiErrorMessage } from '@/lib/utils';

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  points: number;
  badge?: string;
  duration: number;
  tips: string[];
}

interface UserChallenge {
  id: string;
  status: string;
  points: number;
  progress: number;
  challenge: Challenge;
  startedAt?: string;
  completedAt?: string;
}

interface Stats {
  totalPoints: number;
  completedChallenges: number;
  activeChallenges: number;
  badges: { id: string; title: string; description: string; icon: string }[];
}

const categoryColors: Record<string, string> = {
  TRANSPORT: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  FOOD: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  WASTE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  ENERGY: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  LIFESTYLE: 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300',
};

export function ChallengesPage(): React.JSX.Element {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'available' | 'my'>('available');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = async (): Promise<void> => {
    try {
      const [challengesRes, userRes, statsRes] = await Promise.all([
        api.get('/challenges'),
        api.get('/challenges/my'),
        api.get('/challenges/stats'),
      ]);
      setChallenges(challengesRes.data.data.challenges ?? []);
      setUserChallenges(userRes.data.data.challenges ?? []);
      setStats(statsRes.data.data);
    } catch {
      /* empty */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void fetchData(); }, []);

  const joinChallenge = async (id: string): Promise<void> => {
    setActionLoading(id);
    try {
      await api.post(`/challenges/${id}/join`);
      await fetchData();
      setActiveTab('my');
    } catch (err) {
      alert(getApiErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  const completeChallenge = async (id: string): Promise<void> => {
    setActionLoading(id);
    try {
      await api.put(`/challenges/${id}/complete`);
      await fetchData();
    } catch (err) {
      alert(getApiErrorMessage(err));
    } finally {
      setActionLoading(null);
    }
  };

  const joinedIds = userChallenges.map((uc) => uc.challenge.id);

  return (
    <Layout title="Challenges">
      <div className="space-y-6">
        {/* Header & Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="w-6 h-6 text-primary" aria-hidden="true" />
              Sustainability Challenges
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Complete eco-challenges to earn points and badges
            </p>
          </div>
        </div>

        {/* Stats row */}
        {stats && (
          <div className="grid grid-cols-3 gap-4" role="region" aria-label="Your challenge statistics">
            {[
              { label: 'Total Points', value: stats.totalPoints, icon: Zap, color: 'text-yellow-500' },
              { label: 'Completed', value: stats.completedChallenges, icon: CheckCircle2, color: 'text-green-500' },
              { label: 'Active', value: stats.activeChallenges, icon: Target, color: 'text-blue-500' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-card border border-border rounded-xl p-4 text-center">
                <Icon className={`w-6 h-6 mx-auto mb-1.5 ${color}`} aria-hidden="true" />
                <div className="text-2xl font-bold">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Badges */}
        {stats && stats.badges.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" aria-hidden="true" />
              Your Badges
            </h3>
            <div className="flex flex-wrap gap-2" role="list" aria-label="Earned badges">
              {stats.badges.map((badge) => (
                <div
                  key={badge.id}
                  role="listitem"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-full text-sm"
                  aria-label={`Badge: ${badge.title}`}
                >
                  <span aria-hidden="true">{badge.icon}</span>
                  <span className="font-medium text-yellow-800 dark:text-yellow-300 text-xs">{badge.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div
          role="tablist"
          aria-label="Challenge tabs"
          className="flex border-b border-border gap-4"
        >
          {[
            { key: 'available' as const, label: `All Challenges (${challenges.length})` },
            { key: 'my' as const, label: `My Challenges (${userChallenges.length})` },
          ].map(({ key, label }) => (
            <button
              key={key}
              role="tab"
              aria-selected={activeTab === key}
              onClick={() => setActiveTab(key)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-t
                ${activeTab === key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" aria-busy="true" aria-label="Loading challenges">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
          </div>
        ) : (
          <div
            role="tabpanel"
            aria-label={activeTab === 'available' ? 'All challenges' : 'Your challenges'}
          >
            {activeTab === 'available' && (
              challenges.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>No challenges available yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {challenges.map((challenge) => {
                    const joined = joinedIds.includes(challenge.id);
                    const catColor = categoryColors[challenge.category] ?? '';
                    return (
                      <article
                        key={challenge.id}
                        className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                        aria-label={`Challenge: ${challenge.title}`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-semibold text-sm">{challenge.title}</h3>
                          <span className={`flex-shrink-0 inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${catColor}`}>
                            {challenge.category}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{challenge.description}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <Zap className="h-3 w-3 text-yellow-500" aria-hidden="true" />
                            {challenge.points} pts
                          </span>
                          <span>{challenge.duration} days</span>
                          {challenge.badge && (
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500" aria-hidden="true" />
                              {challenge.badge}
                            </span>
                          )}
                        </div>
                        {challenge.tips.length > 0 && (
                          <ul className="text-xs text-muted-foreground space-y-0.5 mb-3" aria-label="Tips for this challenge">
                            {challenge.tips.slice(0, 2).map((tip, i) => (
                              <li key={i} className="flex items-start gap-1">
                                <span aria-hidden="true">•</span> {tip}
                              </li>
                            ))}
                          </ul>
                        )}
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() => void joinChallenge(challenge.id)}
                          disabled={joined || actionLoading === challenge.id}
                          loading={actionLoading === challenge.id}
                          aria-label={joined ? 'Already joined' : `Join ${challenge.title}`}
                        >
                          {joined ? (
                            <><CheckCircle2 className="h-4 w-4 mr-1" /> Joined</>
                          ) : (
                            <><Plus className="h-4 w-4 mr-1" /> Join Challenge</>
                          )}
                        </Button>
                      </article>
                    );
                  })}
                </div>
              )
            )}

            {activeTab === 'my' && (
              userChallenges.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>You haven't joined any challenges yet.</p>
                  <Button variant="outline" className="mt-4" onClick={() => setActiveTab('available')}>
                    Browse Challenges
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {userChallenges.map((uc) => (
                    <article
                      key={uc.id}
                      className="bg-card border border-border rounded-xl p-5"
                      aria-label={`Your challenge: ${uc.challenge.title}`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <h3 className="font-semibold text-sm">{uc.challenge.title}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">{uc.challenge.description}</p>
                        </div>
                        <span className={`flex-shrink-0 inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          uc.status === 'COMPLETED' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' :
                          'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                        }`}>
                          {uc.status === 'COMPLETED' ? 'Completed' : 'In Progress'}
                        </span>
                      </div>
                      <Progress value={uc.progress} label={`${uc.challenge.title} progress`} className="mb-2" />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{uc.progress.toFixed(0)}% complete</span>
                        {uc.status !== 'COMPLETED' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => void completeChallenge(uc.challenge.id)}
                            loading={actionLoading === uc.challenge.id}
                            aria-label={`Mark ${uc.challenge.title} as complete`}
                          >
                            Mark Complete
                          </Button>
                        )}
                        {uc.status === 'COMPLETED' && (
                          <span className="text-xs font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" /> +{uc.points} pts
                          </span>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
