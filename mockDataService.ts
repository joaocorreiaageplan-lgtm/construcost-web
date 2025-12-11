import { Budget, BudgetStatus, AttachedFile } from '../types';

const STORAGE_KEY = 'construcost_budgets';
const SETTINGS_KEY = 'construcost_settings';

const generateId = () => Math.random().toString(36).substr(2, 9);

const INITIAL_DATA: Budget[] = [
  {
    id: '1',
    date: '2023-10-01',
    clientName: 'Construtora Exemplo Ltda',
    serviceDescription: 'PR0930 rev.01 2022 - Expansão do Galpão',
    budgetAmount: 150000,
    discount: 5000,
    orderConfirmation: true,
    invoiceSent: true,
    status: BudgetStatus.APPROVED,
    orderDate: '2023-10-05',
    orderNumber: 'PO-9981',
    invoiceNumber: 'NF-2023-001',
    sendToClient: true,
    requester: 'João Silva',
    files: [{ id: 'f1', name: 'Planta_Baixa_v1.pdf', url: '#', type: 'pdf' }]
  },
  {
    id: '2',
    date: '2023-10-15',
    clientName: 'Comercial Global S.A.',
    serviceDescription: 'PR0931 - Reforma do Escritório',
    budgetAmount: 45000,
    discount: 0,
    orderConfirmation: false,
    invoiceSent: false,
    status: BudgetStatus.PENDING,
    sendToClient: false,
    requester: 'Maria Santos',
    files: []
  },
  {
    id: '3',
    date: '2023-10-20',
    clientName: 'Indústrias Reunidas',
    serviceDescription: 'PR0932 - Piso Fabril',
    budgetAmount: 82000,
    discount: 2000,
    orderConfirmation: false,
    invoiceSent: false,
    status: BudgetStatus.NOT_APPROVED,
    sendToClient: true,
    requester: 'João Silva',
    files: []
  },
  {
    id: '4',
    date: '2023-11-01',
    clientName: 'Tecnologia Inovadora',
    serviceDescription: 'PR0933 - Refrigeração Sala de Servidores',
    budgetAmount: 25000,
    discount: 0,
    orderConfirmation: true,
    invoiceSent: false,
    status: BudgetStatus.APPROVED,
    orderDate: '2023-11-03',
    orderNumber: 'PED-4420',
    sendToClient: true,
    requester: 'Pedro Souza',
    files: [{ id: 'f2', name: 'Foto_Local.jpg', url: 'https://picsum.photos/200/300', type: 'image' }]
  }
];

export interface AppSettings {
  driveConnected: boolean;
  driveFolderName: string;
  autoSync: boolean;
  emailNotifications: boolean;
  googleClientId?: string; // Real API Config
  googleApiKey?: string;   // Real API Config
  googleSheetId?: string;  // Real Sheet Connection
}

const INITIAL_SETTINGS: AppSettings = {
  driveConnected: false,
  driveFolderName: '',
  autoSync: false,
  emailNotifications: true,
  googleClientId: '',
  googleApiKey: '',
  googleSheetId: ''
};

export const getBudgets = (): Budget[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
    return INITIAL_DATA;
  }
  return JSON.parse(data);
};

export const saveBudget = (budget: Budget): Budget => {
  const budgets = getBudgets();
  const index = budgets.findIndex(b => b.id === budget.id);
  
  if (index >= 0) {
    budgets[index] = budget;
  } else {
    budget.id = generateId();
    budgets.push(budget);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(budgets));
  return budget;
};

export const deleteBudget = (id: string): void => {
  const budgets = getBudgets();
  const newBudgets = budgets.filter(b => b.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newBudgets));
};

export const getSettings = (): AppSettings => {
  const data = localStorage.getItem(SETTINGS_KEY);
  if (!data) {
    return INITIAL_SETTINGS;
  }
  return JSON.parse(data);
};

export const saveSettings = (settings: AppSettings): void => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const getStats = (): any => {
  const budgets = getBudgets();
  const totalEstimates = budgets.length;
  const approvedCount = budgets.filter(b => b.status === BudgetStatus.APPROVED).length;
  const rejectedCount = budgets.filter(b => b.status === BudgetStatus.NOT_APPROVED).length;
  const pendingCount = budgets.filter(b => b.status === BudgetStatus.PENDING).length;
  
  const totalValueApproved = budgets
    .filter(b => b.status === BudgetStatus.APPROVED)
    .reduce((acc, curr) => acc + (curr.budgetAmount - curr.discount), 0);

  const totalValuePending = budgets
    .filter(b => b.status === BudgetStatus.PENDING)
    .reduce((acc, curr) => acc + (curr.budgetAmount - curr.discount), 0);

  const invoicePendingCount = budgets.filter(b => b.status === BudgetStatus.APPROVED && !b.invoiceSent).length;

  return {
    totalEstimates,
    approvedCount,
    rejectedCount,
    pendingCount,
    totalValueApproved,
    totalValuePending,
    invoicePendingCount
  };
};