import React from 'react';
import { PurchaseContract, ContractStatus } from '../types';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';
import { getPurchaseContractStatusByDate, toPersianDigits, formatCurrency } from '../utils/dateFormatter';

interface PurchaseContractTableProps {
  contracts: PurchaseContract[];
  onEdit: (contract: PurchaseContract) => void;
  onDelete: (contractId: number) => void;
  selectedIds: number[];
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: () => void;
}

const statusStyles: { [key in ContractStatus]: string } = {
  'فعال': 'bg-green-100 text-green-700',
  'در انتظار تایید': 'bg-yellow-100 text-yellow-700',
  'منقضی شده': 'bg-slate-100 text-slate-600',
  'لغو شده': 'bg-red-100 text-red-700',
};

const PurchaseContractTable: React.FC<PurchaseContractTableProps> = ({ contracts, onEdit, onDelete, selectedIds, onToggleSelect, onToggleSelectAll }) => {
  const allOnPageSelected = contracts.length > 0 && contracts.every(c => selectedIds.includes(c.id));

  if (contracts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200/80 p-16 text-center">
        <h3 className="text-xl font-semibold text-slate-700">هیچ قراردادی یافت نشد</h3>
        <p className="text-gray-500 mt-2">یک قرارداد جدید از طریق دکمه "قرارداد جدید" اضافه کنید.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200/80 overflow-hidden">
        {/* Mobile & Tablet Card View (for screens smaller than lg) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-px bg-gray-200">
        {contracts.map(contract => {
            const displayStatus = getPurchaseContractStatusByDate(contract.contractStartDate, contract.contractEndDate);
            return (
              <div key={contract.id} className="bg-white p-4 space-y-3 relative">
                  <div className="absolute top-4 left-4 z-10">
                    <input 
                      type="checkbox"
                      className="h-5 w-5 text-cyan-600 bg-gray-100 border-gray-300 rounded focus:ring-cyan-500"
                      checked={selectedIds.includes(contract.id)}
                      onChange={() => onToggleSelect(contract.id)}
                      onClick={e => e.stopPropagation()}
                    />
                  </div>
                  <div className="flex items-start justify-between">
                      <div>
                          <p className="font-bold text-slate-800">{contract.customerName}</p>
                          <p className="text-sm text-gray-500 font-mono">{toPersianDigits(contract.contractId)}</p>
                      </div>
                       <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${statusStyles[displayStatus]}`}>
                          {displayStatus}
                      </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1 pt-2 border-t border-gray-100">
                      <p>نوع قرارداد: {contract.contractType}</p>
                      <p>مبلغ کل: <span className="font-mono">{formatCurrency(contract.totalAmount)}</span> ریال</p>
                  </div>
                  <div className="flex items-center justify-end pt-2">
                      <div className="flex items-center gap-2">
                          <button
                              onClick={() => onEdit(contract)}
                              className="p-2 text-yellow-500 hover:text-yellow-600 rounded-full hover:bg-yellow-100 transition-colors"
                          >
                              <EditIcon />
                          </button>
                          <button
                              onClick={() => onDelete(contract.id)}
                              className="p-2 text-red-500 hover:text-red-600 rounded-full hover:bg-red-100 transition-colors"
                          >
                              <TrashIcon />
                          </button>
                      </div>
                  </div>
              </div>
            )
        })}
        </div>


      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-sm text-right text-gray-600">
          <thead className="text-xs text-cyan-700 font-semibold uppercase bg-slate-50 tracking-wider">
            <tr>
              <th scope="col" className="p-4">
                <div className="flex items-center">
                  <input id="checkbox-all-purchase" type="checkbox"
                    onChange={onToggleSelectAll}
                    checked={allOnPageSelected}
                    className="w-4 h-4 text-cyan-600 bg-gray-100 border-gray-300 rounded focus:ring-cyan-500" />
                  <label htmlFor="checkbox-all-purchase" className="sr-only">checkbox</label>
                </div>
              </th>
              <th scope="col" className="px-6 py-4">شناسه قرارداد</th>
              <th scope="col" className="px-6 py-4">مشتری</th>
              <th scope="col" className="px-6 py-4">نوع</th>
              <th scope="col" className="px-6 py-4">مبلغ (ریال)</th>
              <th scope="col" className="px-6 py-4">وضعیت</th>
              <th scope="col" className="px-6 py-4 text-left">اقدامات</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map(contract => {
              const displayStatus = getPurchaseContractStatusByDate(contract.contractStartDate, contract.contractEndDate);
              return (
              <tr key={contract.id} className="border-b border-gray-200 hover:bg-slate-50/50 transition-colors duration-200">
                <td className="w-4 p-4">
                  <div className="flex items-center">
                    <input id={`checkbox-purchase-${contract.id}`} type="checkbox"
                      checked={selectedIds.includes(contract.id)}
                      onChange={() => onToggleSelect(contract.id)}
                      className="w-4 h-4 text-cyan-600 bg-gray-100 border-gray-300 rounded focus:ring-cyan-500" />
                    <label htmlFor={`checkbox-purchase-${contract.id}`} className="sr-only">checkbox</label>
                  </div>
                </td>
                <td className="px-6 py-4 font-mono font-medium text-slate-800">{toPersianDigits(contract.contractId)}</td>
                <td className="px-6 py-4">{contract.customerName}</td>
                <td className="px-6 py-4">{contract.contractType}</td>
                <td className="px-6 py-4 font-mono">{formatCurrency(contract.totalAmount)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${statusStyles[displayStatus]}`}>
                    {displayStatus}
                  </span>
                </td>
                <td className="px-6 py-4 text-left">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(contract)}
                      className="p-2 text-yellow-500 hover:text-yellow-600 rounded-full hover:bg-yellow-100 transition-colors"
                      aria-label={`ویرایش قرارداد ${contract.contractId}`}
                    >
                      <EditIcon />
                    </button>
                    <button
                      onClick={() => onDelete(contract.id)}
                      className="p-2 text-red-500 hover:text-red-600 rounded-full hover:bg-red-100 transition-colors"
                      aria-label={`حذف قرارداد ${contract.contractId}`}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PurchaseContractTable;