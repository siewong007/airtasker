import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useCategories } from '@/hooks/useCategories';
import { TaskStatus } from '@/types';
import TaskCard from '@/components/TaskCard';
import SearchAutocomplete from '@/components/SearchAutocomplete';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function BrowseTasks() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [categoryId, setCategoryId] = useState<number | undefined>(
    searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : undefined
  );
  const [status, setStatus] = useState<TaskStatus | undefined>(
    (searchParams.get('status') as TaskStatus) || undefined
  );
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [page, setPage] = useState(0);

  const { data: categories } = useCategories();
  const { data: tasksData, isLoading, refetch } = useTasks({
    search: search || undefined,
    categoryId,
    status,
    location: location || undefined,
    page,
    size: 12,
  });

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (categoryId) params.set('categoryId', categoryId.toString());
    if (status) params.set('status', status);
    if (location) params.set('location', location);
    setSearchParams(params);
  }, [search, categoryId, status, location, setSearchParams]);

  const handleSearch = () => {
    setPage(0);
    refetch();
  };

  const clearFilters = () => {
    setSearch('');
    setCategoryId(undefined);
    setStatus(undefined);
    setLocation('');
    setPage(0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters Sidebar */}
        <div className={`md:w-64 flex-shrink-0 ${showFilters ? '' : 'hidden md:block'}`}>
          <div className="bg-white rounded-lg border p-4 sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Filters</h2>
              <button
                onClick={clearFilters}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Clear all
              </button>
            </div>

            {/* Status Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={status || ''}
                onChange={(e) => setStatus(e.target.value as TaskStatus || undefined)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={categoryId || ''}
                onChange={(e) =>
                  setCategoryId(e.target.value ? Number(e.target.value) : undefined)
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Categories</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter location"
                className="w-full px-3 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Search Bar */}
          <div className="mb-6">
            <SearchAutocomplete
              value={search}
              onChange={setSearch}
              onSubmit={handleSearch}
            />
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden flex items-center mb-4 text-gray-600"
          >
            <Filter className="h-5 w-5 mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>

          {/* Active Filters */}
          {(categoryId || status || location) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {status && (
                <span className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
                  {status.replace('_', ' ')}
                  <button
                    onClick={() => setStatus(undefined)}
                    className="ml-1 hover:text-primary-900"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </span>
              )}
              {categoryId && categories && (
                <span className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
                  {categories.find((c) => c.id === categoryId)?.name}
                  <button
                    onClick={() => setCategoryId(undefined)}
                    className="ml-1 hover:text-primary-900"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </span>
              )}
              {location && (
                <span className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
                  {location}
                  <button
                    onClick={() => setLocation('')}
                    className="ml-1 hover:text-primary-900"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Results */}
          {isLoading ? (
            <LoadingSpinner className="py-12" />
          ) : tasksData?.content.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No tasks found matching your criteria.</p>
              <button
                onClick={clearFilters}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 gap-6">
                {tasksData?.content.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>

              {/* Pagination */}
              {tasksData && tasksData.totalPages > 1 && (
                <div className="flex justify-center mt-8 gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={tasksData.first}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-gray-600">
                    Page {tasksData.number + 1} of {tasksData.totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={tasksData.last}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
