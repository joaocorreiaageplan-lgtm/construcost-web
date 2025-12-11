import React, { useState, useMemo } from 'react';
import { Budget, BudgetStatus } from '../types';
import { Edit2, Trash2, Search, Filter, Plus, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';

interface BudgetListProps {
  budgets: Budget[];
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
}

const BudgetList: React.FC<BudgetListProps> = ({ budgets, onEdit, onDelete, onCreate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredBudgets = useMemo(() => {
    return budgets.filter(b => {
      const matchesSearch = 
        b.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.serviceDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.requester.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.orderNumber && b.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || b.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [budgets, searchTerm, statusFilter]);

  const StatusBadge = ({ status }: { status: BudgetStatus }) => {
    switch (status) {
      case BudgetStatus.APPROVED:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3" /> Aprovado
          </span>
        );
      case BudgetStatus.NOT_APPROVED:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3" /> Não Aprovado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3" /> Pendente
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Gestão de Orçamentos</h1>
        <button
          onClick={onCreate}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Novo Orçamento
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b bg-gray-50 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar clientes, pedido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
            >
              <option value="all">Todos os Status</option>
              {Object.values(BudgetStatus).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3 font-medium">Data</th>
                <th className="px-6 py-3 font-medium">Cliente / Projeto</th>
                <th className="px-6 py-3 font-medium">Valor</th>
                <th className="px-6 py-3 font-medium">Status / Pedido</th>
                <th className="px-6 py-3 font-medium">Doc Ref</th>
                <th className="px-6 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBudgets.length > 0 ? (
                filteredBudgets.map((budget) => (
                  <tr key={budget.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{budget.date}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{budget.clientName}</div>
                      <div className="text-gray-500 text-xs mt-0.5">{budget.serviceDescription}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      R$ {budget.budgetAmount.toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 items-start">
                        <StatusBadge status={budget.status} />
                        {budget.orderNumber && (
                           <span className="text-xs text-green-700 font-mono bg-green-50 px-1.5 py-0.5 rounded border border-green-100">
                             {budget.orderNumber}
                           </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {budget.files.length > 0 ? (
                        <div className="flex items-center gap-1 text-blue-600 hover:underline cursor-pointer">
                          <FileText className="w-3 h-3" />
                          <span>{budget.files[0].name}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Sem arquivos</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEdit(budget)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(budget.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Nenhum orçamento encontrado com esses critérios.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-4 border-t bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
             Sincronizado com Google Sheets "Gestão e Controle de Orçamentos"
          </p>
        </div>
      </div>
    </div>
  );
};

export default BudgetList;