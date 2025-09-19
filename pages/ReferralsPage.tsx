
import React, { useState, useMemo } from 'react';
import { User, Referral, Customer, Ticket, SupportContract } from '../types';
import TicketTable from '../components/TicketTable';
import TicketFormModal from '../components/TicketFormModal';
import ReferTicketModal from '../components/ReferTicketModal';
import Pagination from '../components/Pagination';
import { calculateTicketScore } from '../utils/ticketScoring';
import { UserCheckIcon } from '../components/icons/UserCheckIcon';
import { toPersianDigits } from '../utils/dateFormatter';


interface ReferralsPageProps {
  referrals: Referral[];
  currentUser: User;
  users: User[];
  customers: Customer[];
  supportContracts: SupportContract[];
  onSave: (ticket: Ticket | Omit<Ticket, 'id'>, isFromReferral: boolean) => void;
  onReferTicket: (ticketId: number, isFromReferral: boolean, referredBy: User, referredToUsername: string) => void;
  onToggleWork: (ticketId: number, isFromReferral: boolean) => void;
}

const ITEMS_PER_PAGE = 10;

const ReferralsPage: React.FC<ReferralsPageProps> = ({ referrals, currentUser, users, customers, onSave, onReferTicket, onToggleWork, supportContracts }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [isReferModalOpen, setIsReferModalOpen] = useState(false);
  const [referringTickets, setReferringTickets] = useState<Ticket[] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const handleOpenModal = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => setIsModalOpen(false);

  const handleOpenReferModal = (ticket: Ticket) => {
    setReferringTickets([ticket]);
    setIsReferModalOpen(true);
  };

  const handleOpenGroupReferModal = () => {
    const ticketsToRefer = referredTickets.filter(t => selectedIds.includes(t.id));
    if (ticketsToRefer.length > 0) {
        setReferringTickets(ticketsToRefer);
        setIsReferModalOpen(true);
    }
  };

  const handleCloseReferModal = () => {
    setIsReferModalOpen(false);
    setTimeout(() => setReferringTickets(null), 300);
  };

  const handleSaveTicket = (ticketData: Ticket | Omit<Ticket, 'id'>) => {
    onSave(ticketData, true);
    handleCloseModal();
  };

  const handleReferTicketSubmit = (newAssigneeUsername: string) => {
    if (!referringTickets) return;
    referringTickets.forEach(ticket => {
        onReferTicket(ticket.id, true, currentUser, newAssigneeUsername);
    });
    handleCloseReferModal();
    setSelectedIds([]);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const referredTickets = useMemo(() => {
    const isSuperAdmin = currentUser.role === 'مدیر' && currentUser.accessibleMenus.includes('users');
    let filteredReferrals = (isSuperAdmin ? referrals : referrals.filter(r => r.referredTo === currentUser.username))
      .filter(r => r.ticket.status !== 'اتمام یافته');

    if (searchTerm) {
        const search = searchTerm.toLowerCase();
        filteredReferrals = filteredReferrals.filter(r => {
            const ticket = r.ticket;
            const customer = customers.find(c => c.id === ticket.customerId);
            return (
                ticket.title.toLowerCase().includes(search) ||
                ticket.ticketNumber.toLowerCase().includes(search) ||
                (customer && customer.companyName.toLowerCase().includes(search))
            );
        });
    }

    const scoredReferrals = filteredReferrals.map(r => ({
        referral: r,
        score: calculateTicketScore(r.ticket, customers, supportContracts)
    }));
      
    scoredReferrals.sort((a, b) => {
        if (a.score !== b.score) {
            return a.score - b.score;
        }
        return new Date(b.referral.referralDate).getTime() - new Date(a.referral.referralDate).getTime();
    });

    return scoredReferrals.map(item => ({
        ...item.referral.ticket,
        score: item.score
    }));
  }, [referrals, currentUser, customers, supportContracts, searchTerm]);

  const totalPages = Math.ceil(referredTickets.length / ITEMS_PER_PAGE);
  const paginatedTickets = referredTickets.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleToggleSelect = (id: number) => {
    setSelectedIds(prev => 
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    const paginatedIds = paginatedTickets.map(t => t.id);
    const allOnPageSelected = paginatedIds.length > 0 && paginatedIds.every(id => selectedIds.includes(id));
    if (allOnPageSelected) {
        setSelectedIds(prev => prev.filter(id => !paginatedIds.includes(id)));
    } else {
        setSelectedIds(prev => [...new Set([...prev, ...paginatedIds])]);
    }
  };

  const allOnPageSelected = paginatedTickets.length > 0 && paginatedTickets.every(t => selectedIds.includes(t.id));

  return (
    <div className="flex-1 bg-gray-50 text-slate-800 p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <main className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">ارجاعات</h1>
          <p className="text-gray-500 mt-1">تیکت های ارجاع داده شده به شما در این بخش قابل مشاهده است.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
            <input
              type="text"
              placeholder="جستجوی تیکت (شماره، عنوان، مشتری)..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full max-w-sm bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
            />
            {selectedIds.length > 0 && (
                 <button 
                    onClick={handleOpenGroupReferModal}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <UserCheckIcon className="h-5 w-5" />
                    <span>ارجاع ({toPersianDigits(selectedIds.length)}) مورد</span>
                 </button>
            )}
        </div>
        <div className="flex items-center lg:hidden mb-4">
            <input 
                id="checkbox-all-mobile-referrals" 
                type="checkbox"
                onChange={handleToggleSelectAll}
                checked={allOnPageSelected}
                className="w-4 h-4 text-cyan-600 bg-gray-100 border-gray-300 rounded focus:ring-cyan-500" 
            />
            <label htmlFor="checkbox-all-mobile-referrals" className="mr-2 text-sm font-medium text-gray-700">انتخاب همه در این صفحه</label>
        </div>

        <TicketTable
          tickets={paginatedTickets}
          customers={customers}
          users={users}
          onEdit={handleOpenModal}
          onRefer={handleOpenReferModal}
          onToggleWork={(ticketId) => onToggleWork(ticketId, true)}
          isReferralTable={true}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
        />
        <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            totalItems={referredTickets.length}
        />

        {isModalOpen && (
          <TicketFormModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSave={handleSaveTicket}
            ticket={editingTicket}
            customers={customers}
            users={users}
            currentUser={currentUser}
          />
        )}
        
        {isReferModalOpen && (
          <ReferTicketModal
            isOpen={isReferModalOpen}
            onClose={handleCloseReferModal}
            onRefer={handleReferTicketSubmit}
            tickets={referringTickets}
            users={users}
            currentUser={currentUser}
          />
        )}
      </main>
    </div>
  );
};

export default ReferralsPage;