import React, { useState } from 'react';
import { User } from '../types';
import UserTable from '../components/UserTable';
import UserFormModal from '../components/UserFormModal';
import { PlusIcon } from '../components/icons/PlusIcon';
import Pagination from '../components/Pagination';
import { toPersianDigits } from '../utils/dateFormatter';
import { TrashIcon } from '../components/icons/TrashIcon';

interface UserManagementProps {
  users: User[];
  onSave: (user: User | Omit<User, 'id'>) => void;
  onDelete: (userId: number) => void;
  onDeleteMany: (userIds: number[]) => void;
}

const ITEMS_PER_PAGE = 10;

const UserManagement: React.FC<UserManagementProps> = ({ users, onSave, onDelete, onDeleteMany }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const handleOpenModal = (user: User | null = null) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setEditingUser(null), 300);
  };

  const handleSaveUser = (userData: User | Omit<User, 'id'>) => {
    onSave(userData);
    handleCloseModal();
  };
  
  const filteredUsers = users.filter(user => 
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleToggleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    const paginatedIds = paginatedUsers.map(u => u.id);
    const allOnPageSelected = paginatedIds.length > 0 && paginatedIds.every(id => selectedIds.includes(id));

    if (allOnPageSelected) {
      setSelectedIds(prev => prev.filter(id => !paginatedIds.includes(id)));
    } else {
      setSelectedIds(prev => [...new Set([...prev, ...paginatedIds])]);
    }
  };

  const handleDeleteSelected = () => {
    if (window.confirm(`آیا از حذف ${toPersianDigits(selectedIds.length)} کاربر انتخاب شده اطمینان دارید؟`)) {
      onDeleteMany(selectedIds);
      setSelectedIds([]);
    }
  };

  const allOnPageSelected = paginatedUsers.length > 0 && paginatedUsers.every(u => selectedIds.includes(u.id));

  return (
    <div className="flex-1 bg-gray-50 text-slate-800 p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <main className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">مدیریت کاربران CRM</h1>
            <p className="text-gray-500 mt-1">کاربران سیستم CRM خود را ایجاد و مدیریت کنید.</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-50"
          >
            <PlusIcon />
            <span>کاربر جدید</span>
          </button>
        </div>

        {/* User Table Section */}
        <div className="mt-8">
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
                 <input
                    type="text"
                    placeholder="جستجوی کاربر..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full max-w-sm bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                />
                {selectedIds.length > 0 && (
                  <button
                    onClick={handleDeleteSelected}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors text-sm whitespace-nowrap"
                  >
                    <TrashIcon />
                    <span>حذف ({toPersianDigits(selectedIds.length)}) مورد</span>
                  </button>
                )}
            </div>
            <div className="flex items-center lg:hidden mb-4">
                <input 
                    id="checkbox-all-mobile-users" 
                    type="checkbox"
                    onChange={handleToggleSelectAll}
                    checked={allOnPageSelected}
                    className="w-4 h-4 text-cyan-600 bg-gray-100 border-gray-300 rounded focus:ring-cyan-500" 
                />
                <label htmlFor="checkbox-all-mobile-users" className="mr-2 text-sm font-medium text-gray-700">انتخاب همه در این صفحه</label>
            </div>
            <UserTable 
              users={paginatedUsers} 
              onEdit={handleOpenModal} 
              onDelete={onDelete} 
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onToggleSelectAll={handleToggleSelectAll}
            />
            <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={ITEMS_PER_PAGE}
                totalItems={filteredUsers.length}
            />
        </div>

        {/* Modal */}
        <UserFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveUser}
          user={editingUser}
          users={users}
        />
      </main>
    </div>
  );
};

export default UserManagement;