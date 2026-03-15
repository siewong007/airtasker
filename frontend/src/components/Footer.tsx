import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-semibold mb-4">TaskMarket</h3>
            <p className="text-sm">
              Get things done with trusted people in your community.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Browse</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/tasks" className="hover:text-white">
                  All Tasks
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-white">
                  Categories
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Account</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/login" className="hover:text-white">
                  Log in
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white">
                  Sign up
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} TaskMarket. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
