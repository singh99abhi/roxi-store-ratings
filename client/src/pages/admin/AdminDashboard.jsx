import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import DataTable from '../../components/DataTable';
import RatingStars from '../../components/RatingStars';
import UserModal from './UserModal';
import StoreModal from './StoreModal';
import UserDetailsModal from './UserDetailsModal';
import api from '../../services/api';
import {
  Users,
  Store,
  Star,
  UserPlus,
  PlusCircle,
  Eye,
  Filter,
  Layers,
  Building
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active tab: 'users' or 'stores'
  const [activeTab, setActiveTab] = useState('users');

  // Modals state
  const [showUserModal, setShowUserModal] = useState(false);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [selectedUserForDetails, setSelectedUserForDetails] = useState(null);

  // Filter state for users
  const [roleFilter, setRoleFilter] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, storesRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/users'),
        api.get('/admin/stores')
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data.users);
      setStores(storesRes.data.stores);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleUserCreated = (newUser) => {
    setUsers((prev) => [newUser, ...prev]);
    setStats((prev) => ({ ...prev, totalUsers: prev.totalUsers + 1 }));
  };

  const handleStoreCreated = (newStore) => {
    setStores((prev) => [newStore, ...prev]);
    setStats((prev) => ({ ...prev, totalStores: prev.totalStores + 1 }));
  };

  // Filtered users by role if set
  const displayedUsers = roleFilter
    ? users.filter((u) => u.role === roleFilter)
    : users;

  const roleBadgeStyle = {
    ADMIN: 'bg-rose-100 text-rose-800 border-rose-200',
    STORE_OWNER: 'bg-amber-100 text-amber-800 border-amber-200',
    USER: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  };

  const roleLabel = {
    ADMIN: 'Admin',
    STORE_OWNER: 'Store Owner',
    USER: 'Normal User'
  };

  const userColumns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (val, row) => (
        <div>
          <button
            onClick={() => setSelectedUserForDetails(row)}
            className="font-semibold text-slate-900 hover:text-emerald-600 text-left transition"
          >
            {val}
          </button>
        </div>
      )
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      render: (val) => <span className="font-mono text-xs text-slate-600">{val}</span>
    },
    {
      key: 'address',
      label: 'Address',
      sortable: true,
      render: (val) => <span className="text-xs text-slate-500 line-clamp-1">{val}</span>
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (val) => (
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
            roleBadgeStyle[val] || 'bg-slate-100'
          }`}
        >
          {roleLabel[val] || val}
        </span>
      )
    },
    {
      key: 'store_rating',
      label: 'Owner Rating',
      sortable: true,
      render: (val, row) => {
        if (row.role !== 'STORE_OWNER') {
          return <span className="text-slate-300 text-xs">—</span>;
        }
        return val ? (
          <div className="flex items-center space-x-1.5">
            <span className="font-bold text-amber-700 text-xs">{val}</span>
            <Star size={13} className="text-amber-500 fill-amber-500" />
          </div>
        ) : (
          <span className="text-xs text-slate-400 italic">No ratings</span>
        );
      }
    },
    {
      key: 'actions',
      label: 'Details',
      sortable: false,
      render: (_, row) => (
        <button
          onClick={() => setSelectedUserForDetails(row)}
          className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition"
        >
          <Eye size={13} />
          <span>View</span>
        </button>
      )
    }
  ];

  const storeColumns = [
    {
      key: 'name',
      label: 'Store Name',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="font-semibold text-slate-900">{val}</span>
          {row.owner_name && (
            <div className="text-xs text-slate-400">Owner: {row.owner_name}</div>
          )}
        </div>
      )
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      render: (val) => <span className="font-mono text-xs text-slate-600">{val}</span>
    },
    {
      key: 'address',
      label: 'Address',
      sortable: true,
      render: (val) => <span className="text-xs text-slate-500 line-clamp-1">{val}</span>
    },
    {
      key: 'overall_rating',
      label: 'Overall Rating',
      sortable: true,
      render: (val, row) => {
        return val ? (
          <div className="flex items-center space-x-2">
            <RatingStars rating={Number(val)} size={14} />
            <span className="font-bold text-slate-700 text-xs">
              {Number(val).toFixed(1)} ({row.total_ratings})
            </span>
          </div>
        ) : (
          <span className="text-xs text-slate-400 italic">No ratings yet</span>
        );
      }
    }
  ];

  // Store Owners list for Store creation assignment
  const storeOwnersList = users.filter((u) => u.role === 'STORE_OWNER');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Header & Action Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Administrator Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Platform-wide metrics, system users, and store registry
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => setShowUserModal(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition"
            >
              <UserPlus size={16} />
              <span>Add New User</span>
            </button>
            <button
              onClick={() => setShowStoreModal(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 shadow-xs transition"
            >
              <PlusCircle size={16} className="text-emerald-600" />
              <span>Add New Store</span>
            </button>
          </div>
        </div>

        {/* 3 Overview Stat Cards (Required by challenge spec) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Users size={24} />
            </div>
            <div>
              <div className="text-xs uppercase font-semibold tracking-wider text-slate-400">
                Total Users
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
                {stats.totalUsers}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <Store size={24} />
            </div>
            <div>
              <div className="text-xs uppercase font-semibold tracking-wider text-slate-400">
                Total Stores
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
                {stats.totalStores}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Star size={24} />
            </div>
            <div>
              <div className="text-xs uppercase font-semibold tracking-wider text-slate-400">
                Submitted Ratings
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
                {stats.totalRatings}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs (Users vs Stores) */}
        <div className="border-b border-slate-200 flex space-x-6">
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition ${
              activeTab === 'users'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Users size={18} />
            <span>Users Management ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('stores')}
            className={`pb-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition ${
              activeTab === 'stores'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Building size={18} />
            <span>Stores Management ({stores.length})</span>
          </button>
        </div>

        {/* Tab 1: Users Table */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <DataTable
              columns={userColumns}
              data={displayedUsers}
              searchPlaceholder="Filter users by Name, Email, or Address..."
              emptyMessage="No users match the search criteria."
              filterComponent={
                <div className="flex items-center space-x-2">
                  <Filter size={15} className="text-slate-400" />
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="">All Roles</option>
                    <option value="ADMIN">System Administrator</option>
                    <option value="STORE_OWNER">Store Owner</option>
                    <option value="USER">Normal User</option>
                  </select>
                </div>
              }
            />
          </div>
        )}

        {/* Tab 2: Stores Table */}
        {activeTab === 'stores' && (
          <div className="space-y-4">
            <DataTable
              columns={storeColumns}
              data={stores}
              searchPlaceholder="Filter stores by Name, Email, or Address..."
              emptyMessage="No stores registered yet."
            />
          </div>
        )}
      </main>

      {/* User Creation Modal */}
      {showUserModal && (
        <UserModal
          onClose={() => setShowUserModal(false)}
          onUserCreated={handleUserCreated}
        />
      )}

      {/* Store Creation Modal */}
      {showStoreModal && (
        <StoreModal
          storeOwners={storeOwnersList}
          onClose={() => setShowStoreModal(false)}
          onStoreCreated={handleStoreCreated}
        />
      )}

      {/* User Details Modal */}
      {selectedUserForDetails && (
        <UserDetailsModal
          user={selectedUserForDetails}
          onClose={() => setSelectedUserForDetails(null)}
        />
      )}
    </div>
  );
}
