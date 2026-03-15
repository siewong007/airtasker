import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Users, Zap, CheckCircle } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { useTasks } from '@/hooks/useTasks';
import CategoryCard from '@/components/CategoryCard';
import TaskCard from '@/components/TaskCard';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Home() {
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: tasksData, isLoading: tasksLoading } = useTasks({
    status: 'OPEN',
    size: 6,
  });

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Get Things Done with TaskMarket
            </h1>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Connect with skilled people in your community. Post a task, get offers, and
              get it done.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/post-task"
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-primary-50"
              >
                Post a Task
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/tasks"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-primary-700"
              >
                Browse Tasks
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Post Your Task</h3>
              <p className="text-gray-600">
                Describe what you need done, set your budget, and post it for free.
              </p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Offers</h3>
              <p className="text-gray-600">
                Receive offers from skilled Taskers. Review their profiles and ratings.
              </p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Get It Done</h3>
              <p className="text-gray-600">
                Choose the best offer, get your task done, and pay securely.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Popular Categories</h2>
            <Link
              to="/categories"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              View all
            </Link>
          </div>
          {categoriesLoading ? (
            <LoadingSpinner className="py-12" />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {categories?.slice(0, 10).map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Recent Tasks */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Recent Tasks</h2>
            <Link
              to="/tasks"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              View all
            </Link>
          </div>
          {tasksLoading ? (
            <LoadingSpinner className="py-12" />
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tasksData?.content.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why TaskMarket?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <Shield className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Secure Payments</h3>
              <p className="text-gray-600 text-sm">
                Your payment is held securely until the task is complete.
              </p>
            </div>
            <div className="text-center">
              <Users className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Verified Taskers</h3>
              <p className="text-gray-600 text-sm">
                All Taskers are reviewed and rated by the community.
              </p>
            </div>
            <div className="text-center">
              <Zap className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Quick & Easy</h3>
              <p className="text-gray-600 text-sm">
                Post a task in minutes and get offers right away.
              </p>
            </div>
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Quality Work</h3>
              <p className="text-gray-600 text-sm">
                Get the job done right with skilled professionals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-primary-100 mb-8 text-lg">
            Join thousands of people getting things done every day.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center px-8 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-primary-50"
          >
            Sign Up Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
