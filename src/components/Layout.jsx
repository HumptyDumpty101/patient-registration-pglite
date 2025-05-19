import { Link } from 'react-router-dom';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen w-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="text-xl font-bold text-gray-900">
                Patient Registration App
              </Link>
            </div>
            <nav className="flex space-x-8">
              <Link to="/" className="text-lime-600 hover:text-lime-400 px-3 py-2 text-sm font-medium">
                Home
              </Link>
              <Link to="/register" className="text-gray-600 hover:text-indigo-600 px-3 py-2 text-sm font-medium">
                Register
              </Link>
              <Link to="/query" className="text-gray-600 hover:text-indigo-600 px-3 py-2 text-sm font-medium">
                SQL Query
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="bg-white py-4 border-t">
        <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
          &copy; {new Date().getFullYear()} Patient Registration App. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Layout;