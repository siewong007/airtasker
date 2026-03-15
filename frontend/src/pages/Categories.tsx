import { useCategories } from '@/hooks/useCategories';
import CategoryCard from '@/components/CategoryCard';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Categories() {
  const { data: categories, isLoading } = useCategories();

  if (isLoading) {
    return <LoadingSpinner className="py-24" size="lg" />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse by Category</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Find the right help for any task. Choose a category to see available tasks.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {categories?.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
}
