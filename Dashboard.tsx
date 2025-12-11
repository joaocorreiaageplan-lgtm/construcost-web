import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { DollarSign, FileText, CheckCircle, AlertCircle, Clock, RefreshCw, FileSpreadsheet, Info } from 'lucide-react';
import { getStats, saveBudget, getBudgets } from '../services/mockDataService';
import { BudgetStatus, Budget } from '../types';

interface DashboardProps {
  onDataUpdated?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onDataUpdated }) => {
  // Force update to refresh stats when syncing
  const [key, setKey] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const stats = useMemo(() => getStats(), [key]);

  const handleSyncDrive = async () => {
    setIsSyncing(true);
    
    // Simulate API delay reading from Google Sheets
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulação baseada nos dados REAIS do PDF do usuário
    const sheetDataSimulation = [
      {
        code: "PR0961",
        description: "PR0961 rev.00 06.2022 - Gi De Diária Eletricista.xlsx",
        client: "GI DE",
        value: 7321.87,
        status: BudgetStatus.APPROVED,
        po: "50887",
        date: "2022-06-01"
      },
      {
        code: "PR0966",
        description: "PR0966 rev.00 07.2022 - CC COTIA - Adequação Elétrica",
        client: "NDI",
        value: 9842.83,
        status: BudgetStatus.APPROVED,
        po: "4500694477",
        date: "2022-07-05"
      },
      {
        code: "PR0969",
        description: "PR0969 rev.00 07.2022 - CC ITU - Adequação Elétrica",
        client: "NDI",
        value: 17794.03,
        status: BudgetStatus.APPROVED,
        po: "8000016305",
        date: "2022-07-10"
      },
      {
        code: "PR0970",
        description: "PR0970 rev.00 07.2022 - CC RIBEIRÃO PIRES - Adequação Elétrica",
        client: "NDI",
        value: 22810.03,
        status: BudgetStatus.APPROVED,
        po: "8000015984",
        date: "2022-07-12"
      },
      {
        code: "PR0930",
        description: "PR0930 rev.01 01.2022.doc",
        client: "CLIENTE DIVERSOS",
        value: 0,
        status: BudgetStatus.NOT_APPROVED,
        po: undefined,
        date: "2022-01-15"
      }
    ];

    const currentBudgets = getBudgets();
    let addedCount = 0;
    let updatedCount = 0;

    sheetDataSimulation.forEach(row => {
      // Verifica se já existe um orçamento com esse código na descrição
      const exists = currentBudgets.find(b => b.serviceDescription.includes(row.code));

      if (!exists) {
        const newBudget: Budget = {
          id: Math.random().toString(36).substr(2, 9),
          date: row.date,
          clientName: row.client,
          serviceDescription: row.description,
          budgetAmount: row.value,
          discount: 0,
          orderConfirmation: row.status === BudgetStatus.APPROVED,
          invoiceSent: false,
          status: row.status,
          sendToClient: true,
          requester: "Importado via Sheets",
          orderNumber: row.po,
          files: []
        };
        saveBudget(newBudget);
        addedCount++;
      } else {
        updatedCount++;
      }
    });
    
    setKey(prev => prev + 1); // Refresh stats locally
    setIsSyncing(false);
    
    // Notify parent App component to refresh global state
    if (onDataUpdated) {
      onDataUpdated();
    }
    
    if (addedCount > 0) {
      alert(`Sincronização concluída com sucesso!\n\n• ${addedCount} novos orçamentos baixados da Planilha Mestra.\n• ${updatedCount} orçamentos já estavam atualizados.`);
    } else {
      alert("Sincronização concluída. A Planilha Mestra não possui novos registros desde a última atualização.");
    }
  };

  const pieData = [
    { name: 'Aprovado', value: stats.approvedCount },
    { name: 'Pendente', value: stats.pendingCount },
    { name: 'Não Aprovado', value: stats.rejectedCount },
  ];

  const COLORS = ['#10B981', '#F59E0B', '#EF4444'];

  const barData = [
    { name: 'Jan', value: 40000 },
    { name: 'Fev', value: 30000 },
    { name: 'Mar', value: 20000 },
    { name: 'Abr', value: 27800 },
    { name: 'Mai', value: 18900 },
    { name: 'Jun', value: 23900 },
    { name: 'Jul', value: 34900 },
  ];

  const StatCard = ({ title, value, icon: Icon, color, subValue }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-500 font-medium text-sm">{title}</h3>
        <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
        </div>
      </div>
      <div className="mt-auto">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        {subValue && <p className="text-sm text-gray-500 mt-1">{subValue}</p>}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Visão Geral</h1>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mt-1">
               <span className="flex h-2 w-2 relative">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
               </span>
               <p className="text-sm text-gray-700 font-medium">
                  Planilha Mestra: <span className="text-blue-600">Conectada (Modo Simulação)</span>
               </p>
            </div>
            <p className="text-xs text-gray-400 ml-4">Espelhando dados de "Gestão e Controle de Orçamentos"</p>
          </div>
        </div>
        
        <button 
          onClick={handleSyncDrive}
          disabled={isSyncing}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all shadow-sm
            ${isSyncing 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-green-600'}
          `}
        >
          {isSyncing ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <div className="flex items-center gap-2">
               <RefreshCw className="w-4 h-4" />
               <FileSpreadsheet className="w-4 h-4" />
            </div>
          )}
          {isSyncing ? 'Lendo Planilha Mestra...' : 'Sincronizar Sheets & Drive'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Valor Total Aprovado" 
          value={`R$ ${stats.totalValueApproved.toLocaleString('pt-BR')}`} 
          icon={DollarSign} 
          color="bg-green-500" 
        />
        <StatCard 
          title="Orçamentos Pendentes" 
          value={stats.pendingCount} 
          subValue={`Valor: R$ ${stats.totalValuePending.toLocaleString('pt-BR')}`}
          icon={Clock} 
          color="bg-yellow-500" 
        />
        <StatCard 
          title="Total de Orçamentos" 
          value={stats.totalEstimates} 
          icon={FileText} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Faturas Pendentes" 
          value={stats.invoicePendingCount} 
          icon={AlertCircle} 
          color="bg-red-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Volume Mensal</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              />
              <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Distribuição de Status</h3>
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;