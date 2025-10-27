import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { toast } from 'sonner';
import { getRooms, createRoom, deleteRoom } from '../utils/api';
import { Plus, Trash2, Building } from 'lucide-react';

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    capacity: '',
    desk_count: '',
    rows: '',
    columns: ''
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await getRooms();
      setRooms(response.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const roomData = {
        ...formData,
        capacity: parseInt(formData.capacity),
        desk_count: parseInt(formData.desk_count),
        rows: parseInt(formData.rows),
        columns: parseInt(formData.columns)
      };
      
      await createRoom(roomData);
      toast.success('Room added successfully!');
      setDialogOpen(false);
      setFormData({ name: '', capacity: '', desk_count: '', rows: '', columns: '' });
      fetchRooms();
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await deleteRoom(id);
        toast.success('Room deleted successfully!');
        fetchRooms();
      } catch (error) {
        console.error('Error deleting room:', error);
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
              Room Management
            </h1>
            <p className="text-gray-500 mt-2 text-lg">Configure examination rooms and desk layouts</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2" data-testid="add-room-button">
                <Plus className="w-4 h-4" /> Add Room
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Room</DialogTitle>
                <DialogDescription>
                  Configure room details and desk layout
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Room Name *</Label>
                  <Input
                    id="name"
                    data-testid="room-name-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Room 101"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="capacity">Capacity *</Label>
                    <Input
                      id="capacity"
                      data-testid="room-capacity-input"
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      placeholder="60"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="desk_count">Desk Count *</Label>
                    <Input
                      id="desk_count"
                      data-testid="room-desk-count-input"
                      type="number"
                      value={formData.desk_count}
                      onChange={(e) => setFormData({ ...formData, desk_count: e.target.value })}
                      placeholder="30"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rows">Rows *</Label>
                    <Input
                      id="rows"
                      data-testid="room-rows-input"
                      type="number"
                      value={formData.rows}
                      onChange={(e) => setFormData({ ...formData, rows: e.target.value })}
                      placeholder="5"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="columns">Columns *</Label>
                    <Input
                      id="columns"
                      data-testid="room-columns-input"
                      type="number"
                      value={formData.columns}
                      onChange={(e) => setFormData({ ...formData, columns: e.target.value })}
                      placeholder="6"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" data-testid="submit-room-button">
                    Add Room
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.length === 0 ? (
            <Card className="col-span-full border-0 shadow-md">
              <CardContent className="text-center py-12">
                <Building className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No rooms found</p>
                <Button className="mt-4" onClick={() => setDialogOpen(true)} data-testid="add-first-room-button">
                  <Plus className="w-4 h-4 mr-2" /> Add First Room
                </Button>
              </CardContent>
            </Card>
          ) : (
            rooms.map((room) => (
              <Card key={room.id} className="border-0 shadow-md card-hover" data-testid={`room-card-${room.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Building className="w-5 h-5 text-indigo-600" />
                        {room.name}
                      </CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(room.id, room.name)}
                      data-testid={`delete-room-${room.id}`}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-xs text-blue-600 font-medium mb-1">Capacity</p>
                      <p className="text-2xl font-bold text-blue-700">{room.capacity}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-xs text-green-600 font-medium mb-1">Desks</p>
                      <p className="text-2xl font-bold text-green-700">{room.desk_count}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 font-medium mb-2">Layout Configuration</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-700">
                        <span className="font-semibold">{room.rows}</span> Rows
                      </span>
                      <span className="text-gray-400">×</span>
                      <span className="text-gray-700">
                        <span className="font-semibold">{room.columns}</span> Columns
                      </span>
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

export default RoomManagement;
