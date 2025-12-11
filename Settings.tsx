import React, { useState, useEffect } from 'react';
import { Save, Cloud, CheckCircle, RefreshCw, Folder, Mail, Bell, Key, Database, Download, ExternalLink, Info } from 'lucide-react';
import { getSettings, saveSettings, AppSettings, getBudgets } from '../services/mockDataService';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(getSettings());
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleConnectDrive = async () => {
    if (!settings.googleClientId || !settings.googleApiKey) {
      // alert("Para conectar de verdade, insira o Client ID e API Key abaixo (Simulação: vamos prosseguir sem eles).");
      // Removido o alert para ser mais fluido, o aviso visual aparecerá após conectar
    }
    
    setIsConnecting(true);
    // Simula delay de autenticação OAuth2
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setSettings(prev => ({
      ...prev,
      driveConnected: true,
      driveFolderName: 'Gestão de Orçamentos / 2024 (Conectado)' 
    }));
    setIsConnecting(false);
  };

  const handleDisconnect = () => {
    if (confirm("Desconectar do Google Drive? A sincronização automática será interrompida.")) {
      setSettings(prev => ({
        ...prev,
        driveConnected: false,
        driveFolderName: ''
      }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800)); // UX delay
    saveSettings(settings);
    setIsSaving(false);
    alert("Configurações salvas com sucesso!");
  };

  const handleExportData = () => {
    const data = JSON.stringify(getBudgets(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_orcamentos_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-800">Configurações do Sistema</h1>
        <p className="text-gray-500">Gerencie a conexão com o Google e preferências do aplicativo.</p>
      </div>

      {/* Google API Credentials Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
         <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
           <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
              <Key className="w-6 h-6" />
           </div>
           <div>
              <h2 className="text-lg font-semibold text-gray-800">Credenciais da API (Modo Produção)</h2>
              <p className="text-sm text-gray-500">Necessário para conexão real com Google Drive e Sheets</p>
           </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Google Cloud Client ID</label>
              <input
                type="text"
                name="googleClientId"
                value={settings.googleClientId || ''}
                onChange={handleChange}
                placeholder="ex: 123456789-abc...apps.googleusercontent.com"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Google API Key</label>
              <input
                type="password"
                name="googleApiKey"
                value={settings.googleApiKey || ''}
                onChange={handleChange}
                placeholder="AIzaSy..."
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-xs"
              />
            </div>
          </div>
          <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">ID da Planilha Mestra (Google Sheets)</label>
              <input
                type="text"
                name="googleSheetId"
                value={settings.googleSheetId || ''}
                onChange={handleChange}
                placeholder="Cole o ID da planilha (a parte longa na URL)"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-xs"
              />
          </div>
          <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700 flex gap-2 items-start">
             <ExternalLink className="w-4 h-4 mt-0.5 flex-shrink-0" />
             <p>
               Para obter essas chaves, acesse o <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer" className="underline font-bold">Google Cloud Console</a>, crie um projeto e ative as APIs "Google Drive" e "Google Sheets".
             </p>
          </div>
        </div>
      </div>

      {/* Google Drive Integration Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${settings.driveConnected ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Conexão com Pastas</h2>
              <p className="text-sm text-gray-500">Status da sincronização</p>
            </div>
          </div>
          {settings.driveConnected && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
              <CheckCircle className="w-3 h-3" /> Conectado
            </span>
          )}
        </div>

        <div className="p-6 space-y-6">
          {!settings.driveConnected ? (
            <div className="text-center py-6">
              <button
                onClick={handleConnectDrive}
                disabled={isConnecting}
                className={`
                  inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition-all shadow-sm
                  ${isConnecting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
                `}
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Autenticando...
                  </>
                ) : (
                  <>
                    <Cloud className="w-4 h-4" />
                    Autorizar Acesso ao Drive
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Added Warning Banner for Simulation Mode */}
              {!settings.googleApiKey && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                   <div className="p-1 bg-blue-100 rounded text-blue-600 mt-0.5">
                     <Info className="w-4 h-4" />
                   </div>
                   <div>
                     <h4 className="text-sm font-bold text-blue-800">Modo de Simulação Ativo</h4>
                     <p className="text-xs text-blue-600 mt-1 leading-relaxed">
                       O sistema está simulando a leitura da planilha "Gestão e Controle de Orçamentos" porque não foram detectadas Chaves de API reais no painel acima.
                       <br/>
                       Isso permite que você teste todas as funcionalidades usando os dados de exemplo (PR0961, PR0966, etc.) sem precisar configurar um servidor backend agora.
                     </p>
                   </div>
                </div>
              )}

              <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Folder className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Pasta Raiz Vinculada</p>
                    <p className="text-sm text-gray-600">{settings.driveFolderName}</p>
                  </div>
                </div>
                <button 
                  onClick={handleDisconnect}
                  className="text-sm text-red-600 hover:text-red-700 hover:underline"
                >
                  Desconectar
                </button>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="autoSync"
                  name="autoSync"
                  checked={settings.autoSync}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="autoSync" className="text-sm text-gray-700 select-none cursor-pointer">
                  Sincronizar arquivos automaticamente a cada 1 hora
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notifications Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
           <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
              <Bell className="w-6 h-6" />
           </div>
           <div>
              <h2 className="text-lg font-semibold text-gray-800">Notificações</h2>
           </div>
        </div>
        <div className="p-6">
           <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="emailNotifications"
                  name="emailNotifications"
                  checked={settings.emailNotifications}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="emailNotifications" className="text-sm text-gray-700 select-none cursor-pointer flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  Receber alertas por e-mail quando um orçamento for aprovado
                </label>
            </div>
        </div>
      </div>

       {/* Data Management */}
       <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
           <div className="p-2 rounded-lg bg-gray-200 text-gray-700">
              <Database className="w-6 h-6" />
           </div>
           <div>
              <h2 className="text-lg font-semibold text-gray-800">Dados e Backup</h2>
              <p className="text-sm text-gray-500">Exporte seus dados locais antes de implantar</p>
           </div>
        </div>
        <div className="p-6 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Baixe uma cópia de segurança de todos os orçamentos cadastrados neste navegador.
            </div>
            <button
               onClick={handleExportData}
               className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors border border-gray-300"
            >
              <Download className="w-4 h-4" />
              Baixar Backup (JSON)
            </button>
        </div>
      </div>

      <div className="flex justify-end pt-4 gap-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`
            flex items-center gap-2 px-8 py-3 rounded-lg font-medium text-white transition-all shadow-sm
            ${isSaving ? 'bg-green-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}
          `}
        >
          {isSaving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Salvar Alterações
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Settings;