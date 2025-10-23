'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Item {
  id: string;
  name: string;
  value: string;
}

export default function HolidayPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [formData, setFormData] = useState({ name: '', value: '' });
  const [submitting, setSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/items');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      // Sort items by ID
      const sortedData = data.sort((a: Item, b: Item) => a.id.localeCompare(b.id));
      setItems(sortedData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    // Trigger fade-in after component mounts
    setTimeout(() => {
      setIsVisible(true);
    }, 50);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.value.trim()) {
      return;
    }

    try {
      setSubmitting(true);
      
      if (editingItem) {
        // Update existing item
        const response = await fetch('/api/items', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: editingItem.id, name: formData.name, value: formData.value }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Reset form and close edit modal
        setFormData({ name: '', value: '' });
        setEditingItem(null);
        setIsEditOpen(false);
      } else {
        // Create new item
        const response = await fetch('/api/items', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Reset form and close add modal
        setFormData({ name: '', value: '' });
        setIsOpen(false);
      }
      
      // Refresh the items list
      await fetchItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error saving item:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setFormData({ name: item.name, value: item.value });
    setIsEditOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/items?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refresh the items list
      await fetchItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error deleting item:', err);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Holiday Items</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Holiday Items</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <div className={`container mx-auto px-4 py-8 transition-opacity duration-1000 ease-in-out ${
      isVisible ? "opacity-100" : "opacity-0"
    }`}>
      <h1 className="text-3xl font-bold mb-6">Holiday Items</h1>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-32">Actions</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground">
                No items found
              </TableCell>
            </TableRow>
          ) : (
            items.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(item)}
                      className="h-8 w-auto p-0 px-2"
                    >
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button                        
                          size="sm"
                          className="h-8 w-auto p-0 px-2"
                        >
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the item "{item.name}" from the holiday list.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(item.id)}                          
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  </TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.value}</TableCell>
                </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      <div className="mt-4 text-sm text-gray-600">
        Total items: {items.length}
      </div>

      <div className="mt-6">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button>Add Item</Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Add Holiday Item</SheetTitle>
              <SheetDescription>
                Tell us who you are and what you're bringing to the holiday celebration.
              </SheetDescription>
            </SheetHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 mt-6 px-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="value">What you're bringing</Label>
                <Input
                  id="value"
                  type="text"
                  placeholder="e.g., Apple pie, Wine, Side dish"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  required
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Adding...' : 'Add Item'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      {/* Edit Modal */}
      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Edit Holiday Item</SheetTitle>
            <SheetDescription>
              Update the details for this holiday item.
            </SheetDescription>
          </SheetHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 mt-6 px-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Your Name</Label>
              <Input
                id="edit-name"
                type="text"
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-value">What you're bringing</Label>
              <Input
                id="edit-value"
                type="text"
                placeholder="e.g., Apple pie, Wine, Side dish"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                required
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Updating...' : 'Update Item'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsEditOpen(false);
                  setEditingItem(null);
                  setFormData({ name: '', value: '' });
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
