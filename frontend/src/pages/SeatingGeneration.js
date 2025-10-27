import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { getExams, getRooms, generateSeating } from '../utils/api';
import { FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';

const SeatingGeneration = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [seatingMode, setSeatingMode] = useState('two_per_desk');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [examsRes, roomsRes] = await Promise.all([
        getExams(),
        getRooms()
      ]);
      setExams(examsRes.data);
      setRooms(roomsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRoom = (roomId) => {
    setSelectedRooms(prev => 
      prev.includes(roomId)
        ? prev.filter(r => r !== roomId)
        : [...prev, roomId]
    );
  };

  const handleGenerate = async () => {
    if (!selectedExam) {
      toast.error('Please select an exam');
      return;
    }
    if (selectedRooms.length === 0) {
      toast.error('Please select at least one room');
      return;
    }

    setGenerating(true);
    try {
      const response = await generateSeating({
        exam_id: selectedExam,
        room_ids: selectedRooms,
        seating_mode: seatingMode
      });

      toast.success(
        `Seating generated! ${response.data.total_students_assigned}/${response.data.total_eligible_students} students assigned to ${response.data.plans_created} room(s)`
      );
      
      // Navigate to preview
      setTimeout(() => {
        navigate(`/seating/preview/${selectedExam}`);
      }, 1500);
    } catch (error) {
      console.error('Error generating seating:', error);
    } finally {
      setGenerating(false);
    }
  };

  const selectedExamData = exams.find(e => e.id === selectedExam);
  const totalCapacity = selectedRooms.reduce((sum, roomId) => {
    const room = rooms.find(r => r.id === roomId);
    return sum + (room?.capacity || 0);
  }, 0);

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
            Generate Seating Plan
          </h1>
          <p className="text-gray-500 mt-2 text-lg">Create smart seating arrangements for examinations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Select Exam */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  Select Exam
                </CardTitle>
                <CardDescription>Choose the examination for seating arrangement</CardDescription>
              </CardHeader>
              <CardContent>
                {exams.length === 0 ? (
                  <Alert>
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>
                      No exams available. Please create an exam first.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Select value={selectedExam} onValueChange={setSelectedExam}>
                    <SelectTrigger data-testid="select-exam-dropdown">
                      <SelectValue placeholder="Select an exam" />
                    </SelectTrigger>
                    <SelectContent>
                      {exams.map((exam) => (
                        <SelectItem key={exam.id} value={exam.id}>
                          {exam.exam_name} - {exam.date} ({exam.exam_type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </CardContent>
            </Card>

            {/* Step 2: Select Seating Mode */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  Seating Mode
                </CardTitle>
                <CardDescription>Choose how students should be arranged</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" style={{
                  borderColor: seatingMode === 'two_per_desk' ? '#4F46E5' : '#E5E7EB'
                }}>
                  <input
                    type="radio"
                    name="seating_mode"
                    data-testid="seating-mode-two-per-desk"
                    value="two_per_desk"
                    checked={seatingMode === 'two_per_desk'}
                    onChange={(e) => setSeatingMode(e.target.value)}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">CAT Mode (2 per desk)</p>
                    <p className="text-sm text-gray-500 mt-1">Two students per desk from different subjects to minimize malpractice</p>
                  </div>
                </label>
                <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" style={{
                  borderColor: seatingMode === 'one_per_desk' ? '#4F46E5' : '#E5E7EB'
                }}>
                  <input
                    type="radio"
                    name="seating_mode"
                    data-testid="seating-mode-one-per-desk"
                    value="one_per_desk"
                    checked={seatingMode === 'one_per_desk'}
                    onChange={(e) => setSeatingMode(e.target.value)}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">Semester Mode (1 per desk)</p>
                    <p className="text-sm text-gray-500 mt-1">One student per desk in sequential roll number order</p>
                  </div>
                </label>
              </CardContent>
            </Card>

            {/* Step 3: Select Rooms */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  Select Rooms
                </CardTitle>
                <CardDescription>Choose one or more rooms for the exam</CardDescription>
              </CardHeader>
              <CardContent>
                {rooms.length === 0 ? (
                  <Alert>
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>
                      No rooms available. Please add rooms first.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {rooms.map((room) => (
                      <label
                        key={room.id}
                        className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        style={{
                          borderColor: selectedRooms.includes(room.id) ? '#4F46E5' : '#E5E7EB',
                          backgroundColor: selectedRooms.includes(room.id) ? '#EEF2FF' : 'transparent'
                        }}
                      >
                        <input
                          type="checkbox"
                          data-testid={`room-checkbox-${room.id}`}
                          checked={selectedRooms.includes(room.id)}
                          onChange={() => toggleRoom(room.id)}
                          className="mt-1 w-4 h-4 text-indigo-600 rounded"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{room.name}</p>
                          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                            <span>Capacity: {room.capacity}</span>
                            <span>•</span>
                            <span>{room.desk_count} desks</span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Summary Panel */}
          <div className="space-y-6">
            <Card className="border-0 shadow-md sticky top-24">
              <CardHeader>
                <CardTitle>Summary</CardTitle>
                <CardDescription>Review before generating</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedExamData && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-xs text-blue-600 font-semibold mb-1">SELECTED EXAM</p>
                    <p className="font-semibold text-blue-900">{selectedExamData.exam_name}</p>
                    <p className="text-sm text-blue-700 mt-1">{selectedExamData.exam_type}</p>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Seating Mode</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {seatingMode === 'two_per_desk' ? '2 per desk' : '1 per desk'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Rooms Selected</span>
                    <span className="text-sm font-semibold text-gray-900">{selectedRooms.length}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Total Capacity</span>
                    <span className="text-sm font-semibold text-gray-900">{totalCapacity}</span>
                  </div>
                </div>

                {selectedExam && selectedRooms.length > 0 && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <AlertDescription className="text-green-700">
                      Ready to generate seating plan
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  className="w-full h-11 text-base font-semibold"
                  data-testid="generate-seating-button"
                  onClick={handleGenerate}
                  disabled={!selectedExam || selectedRooms.length === 0 || generating}
                >
                  {generating ? (
                    <>
                      <div className="spinner border-2 border-white border-t-transparent rounded-full w-4 h-4 mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Generate Seating Plan
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SeatingGeneration;
