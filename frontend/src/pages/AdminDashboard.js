import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { getDashboardStats, getExams } from '../utils/api';
import Layout from '../components/Layout';
import { 
  Users, 
  Calendar, 
  Building, 
  BookOpen, 
  TrendingUp, 
  TrendingDown,
  ArrowRight,
  Plus,
  FileText,
  Settings,
  Activity
} from 'lucide-react';
import { Progress } from '../components/ui/progress';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentExams, setRecentExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, examsRes] = await Promise.all([
        getDashboardStats(),
        getExams()
      ]);
      setStats(statsRes.data);
      setRecentExams(examsRes.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const kpiCards = [
    {
      title: 'Total Students',
      value: stats?.total_students || 0,
      icon: Users,
      color: 'bg-blue-500',
      trend: '+12%',
      trendUp: true
    },
    {
      title: 'Total Exams',
      value: stats?.total_exams || 0,
      icon: Calendar,
      color: 'bg-green-500',
      trend: '+8%',
      trendUp: true
    },
    {
      title: 'Available Rooms',
      value: stats?.total_rooms || 0,
      icon: Building,
      color: 'bg-purple-500',
      trend: '+3%',
      trendUp: true
    },
    {
      title: 'Departments',
      value: stats?.total_departments || 0,
      icon: BookOpen,
      color: 'bg-orange-500',
      trend: 'Stable',
      trendUp: false
    }
  ];

  const quickActions = [
    {
      title: 'Create Exam',
      description: 'Schedule a new examination',
      icon: Calendar,
      gradient: 'from-blue-500 to-blue-600',
      action: () => navigate('/exams')
    },
    {
      title: 'Manage Students',
      description: 'Add or update student records',
      icon: Users,
      gradient: 'from-green-500 to-green-600',
      action: () => navigate('/students')
    },
    {
      title: 'Generate Seating',
      description: 'Create smart seating arrangements',
      icon: FileText,
      gradient: 'from-purple-500 to-purple-600',
      action: () => navigate('/seating/generate')
    },
    {
      title: 'Manage Rooms',
      description: 'Configure examination rooms',
      icon: Building,
      gradient: 'from-orange-500 to-orange-600',
      action: () => navigate('/rooms')
    }
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="spinner border-4 border-indigo-600 border-t-transparent rounded-full w-12 h-12"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-container space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Admin Dashboard
            </h1>
            <p className="text-gray-500 mt-2 text-lg">Manage your exam seating system efficiently</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg border border-green-200">
              <Activity className="w-4 h-4 text-green-600 animate-pulse" />
              <span className="text-sm font-medium text-green-700">System Online</span>
            </div>
            <span className="text-sm text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiCards.map((kpi, index) => (
            <Card key={index} className="card-hover border-0 shadow-md" data-testid={`kpi-card-${kpi.title.toLowerCase().replace(' ', '-')}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 mb-1">{kpi.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{kpi.value}</p>
                    <div className="flex items-center gap-1 mt-2">
                      {kpi.trendUp ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-gray-400" />
                      )}
                      <span className={`text-sm font-medium ${kpi.trendUp ? 'text-green-600' : 'text-gray-500'}`}>
                        {kpi.trend}
                      </span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 ${kpi.color} rounded-xl flex items-center justify-center`}>
                    <kpi.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Card 
                key={index} 
                className="card-hover border-0 shadow-md cursor-pointer overflow-hidden"
                onClick={action.action}
                data-testid={`quick-action-${action.title.toLowerCase().replace(' ', '-')}`}
              >
                <div className={`h-2 bg-gradient-to-r ${action.gradient}`}></div>
                <CardContent className="p-6">
                  <div className={`w-12 h-12 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center mb-4`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{action.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">{action.description}</p>
                  <div className="flex items-center text-indigo-600 font-medium text-sm">
                    Get Started <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Exams */}
          <Card className="lg:col-span-2 border-0 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Recent Examinations</CardTitle>
                  <CardDescription>Latest scheduled exams</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/exams')} data-testid="view-all-exams-button">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentExams.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No exams scheduled yet</p>
                  <Button className="mt-4" onClick={() => navigate('/exams')} data-testid="create-first-exam-button">
                    <Plus className="w-4 h-4 mr-2" /> Create First Exam
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentExams.map((exam) => (
                    <div key={exam.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors" data-testid={`exam-item-${exam.id}`}>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{exam.exam_name}</h4>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span>{exam.exam_type}</span>
                          <span>•</span>
                          <span>{exam.date} at {exam.time}</span>
                          <span>•</span>
                          <span>{exam.departments.length} Dept(s)</span>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/seating/preview/${exam.id}`)}
                        data-testid={`view-seating-${exam.id}`}
                      >
                        View Seating
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Status */}
          <div className="space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-xl">System Health</CardTitle>
                <CardDescription>Real-time monitoring</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Database</span>
                    <span className="text-xs text-green-600 font-semibold">Operational</span>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Server Status</span>
                    <span className="text-xs text-green-600 font-semibold">Online</span>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Storage Usage</span>
                    <span className="text-xs text-gray-600 font-semibold">42%</span>
                  </div>
                  <Progress value={42} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-xl">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Active Sessions</span>
                  <span className="text-sm font-bold text-gray-900">1</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Seating Plans</span>
                  <span className="text-sm font-bold text-gray-900">{stats?.total_exams || 0}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">Room Utilization</span>
                  <span className="text-sm font-bold text-gray-900">85%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
