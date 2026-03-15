import { Link } from 'react-router-dom';
import { Category } from '@/types';

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      to={`/tasks?categoryId=${category.id}`}
      className="flex flex-col items-center p-6 bg-white rounded-lg border hover:shadow-md transition-shadow"
    >
      <span className="text-4xl mb-3">{category.icon}</span>
      <h3 className="text-gray-900 font-medium text-center">{category.name}</h3>
      {category.description && (
        <p className="text-gray-500 text-sm text-center mt-1 line-clamp-2">
          {category.description}
        </p>
      )}
    </Link>
  );
}
