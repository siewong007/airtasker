import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useCategories } from '@/hooks/useCategories';
import { useCreateTask } from '@/hooks/useTasks';
import { TaskCreateRequest } from '@/types';
import ImageUpload from '@/components/ImageUpload';

export default function PostTask() {
  const navigate = useNavigate();
  const { data: categories } = useCategories();
  const createTask = useCreateTask();
  const [images, setImages] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TaskCreateRequest>({
    defaultValues: {
      locationType: 'IN_PERSON',
      flexible: false,
    },
  });

  const locationType = watch('locationType');

  const onSubmit = async (data: TaskCreateRequest) => {
    const result = await createTask.mutateAsync({ ...data, images });
    navigate(`/tasks/${result.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Post a Task</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Task Title *
          </label>
          <input
            type="text"
            {...register('title', {
              required: 'Title is required',
              minLength: { value: 5, message: 'Title must be at least 5 characters' },
              maxLength: { value: 200, message: 'Title must be less than 200 characters' },
            })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500"
            placeholder="e.g., Help me move furniture to a new apartment"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            {...register('description', {
              required: 'Description is required',
              minLength: { value: 20, message: 'Description must be at least 20 characters' },
            })}
            rows={5}
            className="w-full px-4 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500"
            placeholder="Describe your task in detail. Include what needs to be done, any requirements, and other helpful information..."
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <select
            {...register('categoryId', {
              required: 'Category is required',
              valueAsNumber: true,
            })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Select a category</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="text-red-500 text-sm mt-1">{errors.categoryId.message}</p>
          )}
        </div>

        {/* Budget */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Budget *
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <input
                type="number"
                step="0.01"
                {...register('budgetMin', {
                  valueAsNumber: true,
                })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500"
                placeholder="Minimum (optional)"
              />
            </div>
            <div>
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
          </div>
          {errors.budgetMax && (
            <p className="text-red-500 text-sm mt-1">{errors.budgetMax.message}</p>
          )}
          <div className="mt-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register('flexible')}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-600">
                Budget is flexible
              </span>
            </label>
          </div>
        </div>

        {/* Location Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Task Type
          </label>
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

        {/* Location */}
        {locationType === 'IN_PERSON' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              {...register('location')}
              className="w-full px-4 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g., Sydney CBD, Melbourne"
            />
          </div>
        )}

        {/* Due Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Due Date (optional)
          </label>
          <input
            type="date"
            {...register('dueDate')}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Images (optional)
          </label>
          <ImageUpload images={images} onChange={setImages} />
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50"
          >
            {isSubmitting ? 'Posting...' : 'Post Task'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
