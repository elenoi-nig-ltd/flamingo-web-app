
import AdminLayout from './AdminLayout';
import { useAuth } from '../../hooks/useAuth';

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <AdminLayout title="Dashboard">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Welcome back, {user?.name}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stats Cards */}
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-blue-800">Total Products</h3>
            <p className="mt-2 text-3xl font-bold text-blue-600">124</p>
          </div>
          
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-green-800">Total Orders</h3>
            <p className="mt-2 text-3xl font-bold text-green-600">42</p>
          </div>
          
          <div className="bg-purple-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-purple-800">Active Users</h3>
            <p className="mt-2 text-3xl font-bold text-purple-600">87</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <ul className="divide-y divide-gray-200">
              <li className="py-3">
                <p className="text-sm text-gray-600">New order #1234 placed</p>
                <p className="text-xs text-gray-500">2 minutes ago</p>
              </li>
              <li className="py-3">
                <p className="text-sm text-gray-600">Product "Premium Chair" updated</p>
                <p className="text-xs text-gray-500">15 minutes ago</p>
              </li>
              <li className="py-3">
                <p className="text-sm text-gray-600">New user registered</p>
                <p className="text-xs text-gray-500">1 hour ago</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}