
import React from 'react';
import { Ticket, TicketStatus, TicketPriority, Customer, User } from '../types';
import { ClockIcon } from './icons/ClockIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { DocumentDuplicateIcon } from './icons/DocumentDuplicateIcon';
import TicketActions from './TicketActions';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { PaperClipIcon } from './icons/PaperClipIcon';

interface TicketTableProps {
  tickets: (Ticket & { score?: number })[];
  customers: Customer[];
  users: User[];
  onEdit: (ticket: Ticket) => void;
  onRefer: (ticket: Ticket) => void;
  onToggleWork: (ticketId: number) => void;
  isReferralTable: boolean;
  emptyMessage?: string;
  selectedIds: number[];
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: () => void;
}

const statusStyles: { [key in TicketStatus]: { icon: React.ReactNode, text: string, color: string } } = {
  'انجام نشده': { icon: <DocumentDuplicateIcon />, text: 'انجام نشده', color: 'text-slate-600 bg-slate-100' },
  'در حال پیگیری': { icon: <ClockIcon />, text: 'در حال پیگیری', color: 'text-yellow-600 bg-yellow-100' },
  'اتمام یافته': { icon: <CheckCircleIcon />, text: 'اتمام یافته', color: 'text-green-600 bg-green-100' },
  'ارجاع شده': { icon: <ArrowLeftIcon />, text: 'ارجاع شده', color: 'text-blue-600 bg-blue-100' },
};

const priorityStyles: { [key in TicketPriority]: string } = {
  'کم': 'border-gray-400 text-gray-500',
  'متوسط': 'border-blue-500 text-blue-600',
  'ضطراری': 'border-red-500 text-red-600',
};

const toPersianDigits = (n: string | number): string => {
  if (n === undefined || n === null) return '';
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(n).replace(/[0-9]/g, (w) => persianDigits[parseInt(w, 10)]);
};

const TicketTable: React.FC<TicketTableProps> = ({ tickets, customers, users, onEdit, onRefer, onToggleWork, isReferralTable, emptyMessage, selectedIds, onToggleSelect, onToggleSelectAll }) => {
  
  const allOnPageSelected = tickets.length > 0 && tickets.every(t => selectedIds.includes(t.id));
  
  const getCustomerName = (customerId: number) => customers.find(c => c.id === customerId)?.companyName || 'N/A';
  const getAssigneeName = (username: string) => {
      if (!username) return '-';
      const user = users.find(u => u.username === username);
      return user ? `${user.firstName} ${user.lastName}` : username;
  };

  if (tickets.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200/80 p-16 text-center">
        <h3 className="text-xl font-semibold text-slate-700">هیچ تیکتی یافت نشد</h3>
        <p className="text-gray-500 mt-2">
            {emptyMessage || (isReferralTable ? 'هیچ تیکتی به شما ارجاع داده نشده است.' : 'برای شروع یک تیکت جدید ایجاد کنید.')}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200/80 overflow-hidden">
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-sm text-right text-gray-600">
          <thead className="text-xs text-cyan-700 font-semibold uppercase bg-slate-50 tracking-wider">
            <tr>
              <th scope="col" className="p-4">
                <div className="flex items-center">
                    <input id="checkbox-all" type="checkbox" 
                        onChange={onToggleSelectAll} 
                        checked={allOnPageSelected}
                        className="w-4 h-4 text-cyan-600 bg-gray-100 border-gray-300 rounded focus:ring-cyan-500"/>
                    <label htmlFor="checkbox-all" className="sr-only">checkbox</label>
                </div>
              </th>
              <th scope="col" className="px-6 py-4">شناسه</th>
              <th scope="col" className="px-6 py-4">امتیاز</th>
              <th scope="col" className="px-6 py-4">عنوان</th>
              <th scope="col" className="px-6 py-4">مشتری</th>
              <th scope="col" className="px-6 py-4">وضعیت</th>
              <th scope="col" className="px-6 py-4">کاربر</th>
              <th scope="col" className="px-6 py-4 text-left">اعمال کار و اقدامات</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map(ticket => (
              <tr 
                key={ticket.id} 
                className="border-b border-gray-200 hover:bg-slate-50/50 transition-colors duration-200"
              >
                <td className="p-4 w-4">
                  <div className="flex items-center">
                      <input id={`checkbox-${ticket.id}`} type="checkbox" 
                          checked={selectedIds.includes(ticket.id)} 
                          onChange={() => onToggleSelect(ticket.id)} 
                          onClick={e => e.stopPropagation()}
                          className="w-4 h-4 text-cyan-600 bg-gray-100 border-gray-300 rounded focus:ring-cyan-500"/>
                      <label htmlFor={`checkbox-${ticket.id}`} className="sr-only">checkbox</label>
                  </div>
                </td>
                <td className="px-6 py-4 cursor-pointer" onClick={() => onEdit(ticket)}>
                    <span className={`font-mono text-xs border-r-2 pr-2 ${priorityStyles[ticket.priority]}`}>
                        {toPersianDigits(ticket.ticketNumber)}
                    </span>
                </td>
                <td className="px-6 py-4 text-center cursor-pointer" onClick={() => onEdit(ticket)}>
                  {ticket.score !== undefined && (
                    <span className="font-mono font-bold text-slate-700 bg-slate-200 rounded-full px-2 py-1 text-xs" title="امتیاز اولویت (کمتر = مهم‌تر)">
                      {toPersianDigits(ticket.score)}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 font-medium text-slate-800 cursor-pointer" onClick={() => onEdit(ticket)}>
                    <div className="flex items-center gap-2">
                        {ticket.attachments && ticket.attachments.length > 0 && <PaperClipIcon />}
                        <span>{ticket.title}</span>
                    </div>
                </td>
                <td className="px-6 py-4 cursor-pointer" onClick={() => onEdit(ticket)}>{getCustomerName(ticket.customerId)}</td>
                <td className="px-6 py-4 cursor-pointer" onClick={() => onEdit(ticket)}>
                    <span className={`inline-flex items-center gap-2 px-2.5 py-1 text-xs font-bold rounded-full ${statusStyles[ticket.status]?.color || ''}`}>
                        {statusStyles[ticket.status]?.icon}
                        {statusStyles[ticket.status]?.text}
                    </span>
                </td>
                <td className="px-6 py-4 cursor-pointer" onClick={() => onEdit(ticket)}>{getAssigneeName(ticket.assignedTo)}</td>
                <td className="px-6 py-4 text-left">
                  <TicketActions ticket={ticket} onEdit={onEdit} onRefer={onRefer} onToggleWork={onToggleWork} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
       {/* Mobile & Tablet Card View */}
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-px bg-gray-200">
        {tickets.map(ticket => (
          <div key={ticket.id} className="bg-white p-4 space-y-3 relative">
             <div className="absolute top-4 left-4">
                <input id={`checkbox-mobile-${ticket.id}`} type="checkbox" 
                    checked={selectedIds.includes(ticket.id)} 
                    onChange={() => onToggleSelect(ticket.id)} 
                    className="w-5 h-5 text-cyan-600 bg-gray-100 border-gray-300 rounded focus:ring-cyan-500"/>
                <label htmlFor={`checkbox-mobile-${ticket.id}`} className="sr-only">checkbox</label>
             </div>
            <div onClick={() => onEdit(ticket)}>
                <div className="flex items-start justify-between">
                    <div>
                        <p className="font-bold text-slate-800 flex items-center gap-2">
                          {ticket.attachments && ticket.attachments.length > 0 && <PaperClipIcon />}
                          <span>{ticket.title}</span>
                        </p>
                        <p className="text-sm text-gray-500">{getCustomerName(ticket.customerId)}</p>
                        <p className={`font-mono text-xs pt-1 border-r-2 pr-2 mt-1 ${priorityStyles[ticket.priority]}`}>{toPersianDigits(ticket.ticketNumber)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`inline-flex items-center gap-2 px-2.5 py-1 text-xs font-bold rounded-full ${statusStyles[ticket.status]?.color || ''}`}>
                          {statusStyles[ticket.status]?.icon}
                          {statusStyles[ticket.status]?.text}
                      </span>
                       {ticket.score !== undefined && (
                        <span className="font-mono font-bold text-slate-700 bg-slate-200 rounded-full px-2 py-1 text-xs" title="امتیاز اولویت (کمتر = مهم‌تر)">
                          {toPersianDigits(ticket.score)}
                        </span>
                      )}
                    </div>
                </div>
                <div className="text-sm text-gray-600 pt-2 border-t border-gray-100 mt-2">
                    <p>کاربر: {getAssigneeName(ticket.assignedTo)}</p>
                </div>
            </div>
            <div className="border-t pt-2">
                 <TicketActions ticket={ticket} onEdit={onEdit} onRefer={onRefer} onToggleWork={onToggleWork} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TicketTable;