import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import api from '@/services/api';
import { Category } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AdminCategories() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', description: '', icon: '', slug: '' });

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get<Category[]>('/categories');
      return res.data;
    },
  });

  const createCategory = useMutation({
    mutationFn: (data: typeof form) => api.post('/admin/categories', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setShowForm(false);
      setForm({ name: '', description: '', icon: '', slug: '' });
      toast.success('Category created');
    },
  });

  const updateCategory = useMutation({
    mutationFn: ({ id, data }: { id: number; data: typeof form }) =>
      api.put(`/admin/categories/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setEditingId(null);
      toast.success('Category updated');
    },
  });

  const deleteCategory = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted');
    },
  });

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setForm({ name: cat.name, description: cat.description || '', icon: cat.icon || '', slug: cat.slug || '' });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to="/admin" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
        </div>
        <button
          onClick={() => { setShowForm(true); setForm({ name: '', description: '', icon: '', slug: '' }); }}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Category
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white rounded-lg border p-6 mb-6">
          <h3 className="font-medium text-gray-900 mb-4">New Category</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Name"
              className="px-3 py-2 border rounded-lg"
            />
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="Slug"
              className="px-3 py-2 border rounded-lg"
            />
            <input
              type="text"
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              placeholder="Icon (emoji)"
              className="px-3 py-2 border rounded-lg"
            />
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Description"
              className="px-3 py-2 border rounded-lg"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => createCategory.mutate(form)}
              disabled={!form.name || createCategory.isPending}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              Create
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <LoadingSpinner className="py-12" />
      ) : (
        <div className="bg-white rounded-lg border divide-y">
          {categories?.map((cat) => (
            <div key={cat.id} className="p-4 flex items-center justify-between">
              {editingId === cat.id ? (
                <div className="flex-1 flex items-center gap-3">
                  <input
                    type="text"
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    className="w-12 px-2 py-1 border rounded text-center"
                  />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="flex-1 px-2 py-1 border rounded"
                  />
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="flex-1 px-2 py-1 border rounded"
                    placeholder="Description"
                  />
                  <button
                    onClick={() => updateCategory.mutate({ id: cat.id, data: form })}
                    className="p-1 text-green-600 hover:text-green-800"
                  >
                    <Check className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{cat.icon}</span>
                    <div>
                      <p className="font-medium text-gray-900">{cat.name}</p>
                      {cat.description && (
                        <p className="text-sm text-gray-500">{cat.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(cat)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete "${cat.name}"?`)) {
                          deleteCategory.mutate(cat.id);
                        }
                      }}
                      className="p-1 text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
