import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import { getSeatingPlans, getExam, exportSeatingExcel } from '../utils/api';
import { Download, Printer, FileText } from 'lucide-react';

const SeatingPreview = () => {
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [seatingPlans, setSeatingPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [examId]);

  const fetchData = async () => {
    try {
      const [examRes, plansRes] = await Promise.all([
        getExam(examId),
        getSeatingPlans(examId)
      ]);
      setExam(examRes.data);
      setSeatingPlans(plansRes.data);
    } catch (error) {
      console.error('Error fetching seating data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await exportSeatingExcel(examId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `seating_plan_${exam?.exam_name || 'exam'}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Excel file downloaded successfully!');
    } catch (error) {
      console.error('Error exporting Excel:', error);
    }
  };

  const handlePrint = () => {
    window.print();
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

  if (seatingPlans.length === 0) {
    return (
      <Layout>
        <div className="page-container">
          <Card className="border-0 shadow-md">
            <CardContent className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-lg">No seating plans generated yet</p>
              <p className="text-gray-400 text-sm mt-1">Generate seating plans first</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-container space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start no-print">
          <div>
            <h1 className="text-4xl font-bold text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Seating Plan Preview
            </h1>
            <p className="text-gray-500 mt-2 text-lg">{exam?.exam_name}</p>
            <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full font-semibold">
                {exam?.exam_type}
              </span>
              <span>{exam?.date} at {exam?.time}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handlePrint} data-testid="print-seating-button">
              <Printer className="w-4 h-4 mr-2" /> Print
            </Button>
            <Button onClick={handleExportExcel} data-testid="export-excel-button">
              <Download className="w-4 h-4 mr-2" /> Export Excel
            </Button>
          </div>
        </div>

        {/* Seating Plans */}
        {seatingPlans.map((plan, planIndex) => (
          <Card key={plan.id} className="border-0 shadow-md print-full" data-testid={`seating-plan-${plan.id}`}>
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{plan.room_details?.name}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Total Students: <span className="font-bold text-gray-900">{plan.total_students}</span> | 
                    Capacity: <span className="font-bold text-gray-900">{plan.room_details?.capacity}</span> | 
                    Mode: <span className="font-bold text-gray-900">{plan.seating_mode === 'two_per_desk' ? '2 per desk' : '1 per desk'}</span>
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {/* Classroom Layout */}
              <div className="space-y-4">
                <div className="bg-gray-100 p-3 rounded-lg text-center">
                  <p className="text-sm font-semibold text-gray-700">FRONT (Teacher's Desk)</p>
                </div>

                {/* Desk Grid */}
                <div className="overflow-x-auto">
                  <div className="inline-block min-w-full">
                    <div 
                      className="grid gap-4"
                      style={{
                        gridTemplateColumns: `repeat(${plan.room_details?.columns || 3}, minmax(200px, 1fr))`
                      }}
                    >
                      {plan.desk_assignments.map((desk) => (
                        <div 
                          key={desk.desk_number} 
                          className="bg-white border-2 border-gray-300 rounded-lg p-4 hover:shadow-lg transition-shadow"
                          data-testid={`desk-${desk.desk_number}`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-gray-500">DESK {desk.desk_number}</span>
                            <span className="text-xs text-gray-400">Row {desk.row + 1}, Col {desk.col + 1}</span>
                          </div>
                          
                          {plan.seating_mode === 'two_per_desk' ? (
                            <div className="space-y-2">
                              <div className="bg-blue-50 p-3 rounded border border-blue-200">
                                <p className="text-xs text-blue-600 font-semibold mb-1">LEFT</p>
                                <p className="font-mono text-sm font-bold text-blue-900" data-testid={`left-student-${desk.desk_number}`}>
                                  {desk.left_student || 'Empty'}
                                </p>
                              </div>
                              <div className="bg-green-50 p-3 rounded border border-green-200">
                                <p className="text-xs text-green-600 font-semibold mb-1">RIGHT</p>
                                <p className="font-mono text-sm font-bold text-green-900" data-testid={`right-student-${desk.desk_number}`}>
                                  {desk.right_student || 'Empty'}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-indigo-50 p-3 rounded border border-indigo-200">
                              <p className="text-xs text-indigo-600 font-semibold mb-1">STUDENT</p>
                              <p className="font-mono text-base font-bold text-indigo-900" data-testid={`student-${desk.desk_number}`}>
                                {desk.left_student || 'Empty'}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-100 p-3 rounded-lg text-center">
                  <p className="text-sm font-semibold text-gray-700">BACK</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Layout>
  );
};

export default SeatingPreview;
