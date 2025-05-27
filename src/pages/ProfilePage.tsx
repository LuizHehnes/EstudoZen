import React from 'react';

export const ProfilePage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Perfil do Usuário</h1>
      
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center text-3xl text-primary-600">
            👤
          </div>
          <div>
            <h2 className="text-xl font-semibold">Usuário ZenStudy</h2>
            <p className="text-gray-600">estudante@exemplo.com</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Estatísticas</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-gray-600 text-sm">Tempo total de estudo</p>
                <p className="text-2xl font-bold">24h 35m</p>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-gray-600 text-sm">Sessões completadas</p>
                <p className="text-2xl font-bold">42</p>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-gray-600 text-sm">Dias consecutivos</p>
                <p className="text-2xl font-bold">7</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Configurações</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="notifications" className="text-gray-700">Notificações</label>
                <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                  <input id="notifications" type="checkbox" className="absolute w-6 h-6 transition duration-100 ease-in-out rounded-full appearance-none cursor-pointer peer bg-gray-300 checked:bg-primary-500 checked:translate-x-6" defaultChecked />
                  <span className="absolute w-full h-full transition duration-200 ease-in-out rounded-full bg-gray-200 peer-checked:bg-primary-100"></span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label htmlFor="darkmode" className="text-gray-700">Modo escuro</label>
                <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer">
                  <input id="darkmode" type="checkbox" className="absolute w-6 h-6 transition duration-100 ease-in-out rounded-full appearance-none cursor-pointer peer bg-gray-300 checked:bg-primary-500 checked:translate-x-6" />
                  <span className="absolute w-full h-full transition duration-200 ease-in-out rounded-full bg-gray-200 peer-checked:bg-primary-100"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 