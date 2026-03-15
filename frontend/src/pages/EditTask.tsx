import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTask, useUpdateTask } from '@/hooks/useTasks';
import { useCategories } from '@/hooks/useCategories';
import { TaskCreateRequest } from '@/types';
import ImageUpload from '@/components/ImageUpload';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function EditTask() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: task, isLoading } = useTask(Number(id));
  const { data: categories } = useCategories();
  const updateTask = useUpdateTask();
  const [images, setImages] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskCreateRequest>({
    defaultValues: {
      locationType: 'IN_PERSON',
      flexible: false,
    },
  });

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description,
        budgetMin: task.budgetMin,
        budgetMax: task.budgetMax,
        location: task.location,
        locationType: task.locationType || 'IN_PERSON',
        categoryId: task.category?.id,
        dueDate: task.dueDate?.split('T')[0],
        flexible: task.flexible,
      });
      setImages(task.images || []);
    }
  }, [task, reset]);

  const locationType = watch('locationType');

  if (isLoading) {
    return <LoadingSpinner className="py-24" size="lg" />;
  }

  if (!task) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Task not found</h1>
      </div>
    );
  }

  if (task.status !== 'OPEN') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Cannot edit this task</h1>
        <p className="text-gray-500 mt-2">Only tasks with OPEN status can be edited.</p>
      </div>
    );
  }

  const onSubmit = async (data: TaskCreateRequest) => {
    await updateTask.mutateAsync({ id: task.id, data: { ...data, images } });
    navigate(`/tasks/${task.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Task</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Task Title *</label>
          <input
            type="text"
            {...register('title', {
              required: 'Title is required',
              minLength: { value: 5, message: 'Title must be at least 5 characters' },
              maxLength: { value: 200, message: 'Title must be less than 200 characters' },
            })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500"
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea
            {...register('description', {
              required: 'Description is required',
              minLength: { value: 20, message: 'Description must be at least 20 characters' },
            })}
            rows={5}
            className="w-full px-4 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500"
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
          <select
            {...register('categoryId', { required: 'Category is required', valueAsNumber: true })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Select a category</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
          {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Budget *</label>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              step="0.01"
              {...register('budgetMin', { valueAsNumber: true })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500"
              placeholder="Minimum (optional)"
            />
            <input
              type="number"
              step="0.01"
              {...register('budgetMax', {
                required: 'Maximum budget is required',
                valueAsNumber: true,
                min: { value: 1, message: 'Budget must be positive' },
              })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500"
              placeholder="Maximum *"
            />
          </div>
          {errors.budgetMax && <p className="text-red-500 text-sm mt-1">{errors.budgetMax.message}</p>}
          <div className="mt-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register('flexible')}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-600">Budget is flexible</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Task Type</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="IN_PERSON"
                {...register('locationType')}
                className="text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-600">In Person</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="REMOTE"
                {...register('locationType')}
                className="text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-600">Remote / Online</span>
            </label>
          </div>
        </div>

        {locationType === 'IN_PERSON' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              {...register('location')}
              className="w-full px-4 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g., Sydney CBD, Melbourne"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Due Date (optional)</label>
          <input
            type="date"
            {...register('dueDate')}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
          <ImageUpload images={images} onChange={setImages} />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/tasks/${task.id}`)}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
