import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { getExams, getSeatingPlans } from '../utils/api';
import { Calendar, Eye, FileText } from 'lucide-react';

const InvigilatorDashboard = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await getExams();
      setExams(response.data);
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

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
      <div className="page-container space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Invigilator Dashboard
          </h1>
          <p className="text-gray-500 mt-2 text-lg">View seating arrangements for examinations</p>
        </div>

        {/* Exams List */}
        <div className="grid grid-cols-1 gap-6">
          {exams.length === 0 ? (
            <Card className="border-0 shadow-md">
              <CardContent className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No exams scheduled yet</p>
              </CardContent>
            </Card>
          ) : (
            exams.map((exam) => (
              <Card key={exam.id} className="border-0 shadow-md card-hover" data-testid={`invigilator-exam-${exam.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-2xl">{exam.exam_name}</CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full font-semibold">
                          {exam.exam_type}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {exam.date} at {exam.time}
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={() => navigate(`/seating/preview/${exam.id}`)}
                      data-testid={`view-seating-${exam.id}`}
                      className="flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" /> View Seating Plan
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Departments:</p>
                      <div className="flex flex-wrap gap-2">
                        {exam.departments.map((dept, idx) => (
                          <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                            {dept}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Subjects:</p>
                      <div className="flex flex-wrap gap-2">
                        {exam.subjects.map((subject, idx) => (
                          <span key={idx} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default InvigilatorDashboard;
