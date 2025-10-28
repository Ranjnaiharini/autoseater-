import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { toast } from 'sonner';
import { getDepartments, createDepartment, deleteDepartment } from '../utils/api';
import { Plus, Trash2, BookOpen } from 'lucide-react';

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const user = typeof window !== 'undefined' && localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const isAdmin = user?.role === 'admin';
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    subjects: ''
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await getDepartments();
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const deptData = {
        ...formData,
        subjects: formData.subjects.split(',').map(s => s.trim()).filter(s => s)
      };
      
      await createDepartment(deptData);
      toast.success('Department added successfully!');
      setDialogOpen(false);
      setFormData({ name: '', code: '', subjects: '' });
      fetchDepartments();
    } catch (error) {
      console.error('Error creating department:', error);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await deleteDepartment(id);
        toast.success('Department deleted successfully!');
        fetchDepartments();
      } catch (error) {
        console.error('Error deleting department:', error);
      }
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
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Department Management
            </h1>
            <p className="text-gray-500 mt-2 text-lg">Manage departments and their subjects</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            {isAdmin && (
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2" data-testid="add-department-button">
                  <Plus className="w-4 h-4" /> Add Department
                </Button>
              </DialogTrigger>
            )}
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Department</DialogTitle>
                <DialogDescription>
                  Enter department details
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Department Name *</Label>
                  <Input
                    id="name"
                    data-testid="dept-name-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Computer Science Engineering"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="code">Department Code *</Label>
                  <Input
                    id="code"
                    data-testid="dept-code-input"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g., CSE"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="subjects">Subjects (comma-separated) *</Label>
                  <Input
                    id="subjects"
                    data-testid="dept-subjects-input"
                    value={formData.subjects}
                    onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
                    placeholder="e.g., DBMS, Networks, AI"
                    required
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" data-testid="submit-department-button">
                    Add Department
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {departments.length === 0 ? (
            <Card className="col-span-full border-0 shadow-md">
              <CardContent className="text-center py-12">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No departments found</p>
                {isAdmin && (
                  <Button className="mt-4" onClick={() => setDialogOpen(true)} data-testid="add-first-dept-button">
                    <Plus className="w-4 h-4 mr-2" /> Add First Department
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            departments.map((dept) => (
              <Card key={dept.id} className="border-0 shadow-md card-hover" data-testid={`dept-card-${dept.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{dept.name}</CardTitle>
                      <CardDescription className="text-base font-semibold text-indigo-600 mt-1">
                        {dept.code}
                      </CardDescription>
                    </div>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(dept.id, dept.name)}
                        data-testid={`delete-dept-${dept.id}`}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Subjects:</p>
                    <div className="flex flex-wrap gap-2">
                      {dept.subjects.map((subject, idx) => (
                        <span key={idx} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
                          {subject}
                        </span>
                      ))}
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

export default DepartmentManagement;
