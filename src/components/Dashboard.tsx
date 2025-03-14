import React, { useEffect } from 'react';
import { useIrrigationStore } from '../store/irrigationStore';
import { Droplets, Timer, History, AlertTriangle, Gauge } from 'lucide-react';

export function Dashboard() {
  const { 
    zones, 
    activeZones, 
    sessions, 
    systemStatus,
    fetchZones,
    fetchHistory,
    fetchSystemStatus
  } = useIrrigationStore();
  const toggleZone = useIrrigationStore((state) => state.toggleZone);

  useEffect(() => {
    // Inicijalno učitavanje podataka
    fetchZones();
    fetchHistory();
    fetchSystemStatus();

    // Periodično osvežavanje
    const interval = setInterval(() => {
      fetchSystemStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchZones, fetchHistory, fetchSystemStatus]);

  // Funkcija za određivanje boje gauge-a na osnovu pritiska
  const getPressureColor = (pressure: number) => {
    if (pressure < 1.0) return 'text-red-500';
    if (pressure < 2.0) return 'text-yellow-500';
    return 'text-green-500';
  };

  // Funkcija za izračunavanje rotacije kazaljke gauge-a
  const calculateRotation = (pressure: number) => {
    // Maksimalni pritisak je 3 bara, a rotacija ide od -90 do 90 stepeni
    const rotation = (pressure / 3) * 180 - 90;
    return `rotate(${rotation}deg)`;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Контролна табла</h1>
      
      {/* Gauge za pritisak vode */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-3 mb-4">
          <Gauge className="w-6 h-6 text-blue-500" />
          <h2 className="text-xl font-semibold">Притисак воде у мрежи</h2>
        </div>
        <div className="flex justify-center items-center">
          <div className="relative w-48 h-24 overflow-hidden">
            {/* Pozadina gauge-a */}
            <div className="absolute w-48 h-48 bottom-0 border-[16px] border-gray-200 rounded-full"></div>
            {/* Aktivni deo gauge-a */}
            <div 
              className={`absolute w-48 h-48 bottom-0 border-[16px] rounded-full ${getPressureColor(systemStatus.waterPressure)}`}
              style={{
                borderColor: 'currentColor transparent transparent transparent',
                transform: calculateRotation(systemStatus.waterPressure),
                transformOrigin: 'bottom center',
                transition: 'transform 0.5s ease-out'
              }}
            ></div>
            {/* Vrednost pritiska */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-center">
              <span className={`text-2xl font-bold ${getPressureColor(systemStatus.waterPressure)}`}>
                {systemStatus.waterPressure.toFixed(1)}
              </span>
              <span className="text-sm text-gray-500 block">bar</span>
            </div>
          </div>
        </div>
      </div>
      
      {systemStatus.isLowPressure && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex items-center">
            <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
            <div>
              <h3 className="text-red-800 font-medium">Низак притисак воде!</h3>
              <p className="text-red-700 text-sm">
                Тренутни притисак: {systemStatus.waterPressure.toFixed(1)} bar
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {zones.map((zone) => (
          <div key={zone.id} className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">{zone.name}</h3>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">
                Статус: {activeZones.includes(zone.id) ? 'Активна' : 'Неактивна'}
              </span>
              <button
                onClick={() => toggleZone(zone.id)}
                className={`px-4 py-2 rounded-md ${
                  activeZones.includes(zone.id)
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-green-500 hover:bg-green-600'
                } text-white`}
              >
                {activeZones.includes(zone.id) ? 'Искључи' : 'Укључи'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <Droplets className="w-6 h-6 text-blue-500" />
            <h3 className="text-xl font-semibold">Потрошња воде</h3>
          </div>
          <p className="text-2xl font-bold">
            {sessions.reduce((acc, session) => acc + session.waterUsage, 0)} л
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <Timer className="w-6 h-6 text-green-500" />
            <h3 className="text-xl font-semibold">Активни тајмери</h3>
          </div>
          <p className="text-2xl font-bold">
            {zones.reduce((acc, zone) => acc + zone.schedule.filter(s => s.active).length, 0)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <History className="w-6 h-6 text-purple-500" />
            <h3 className="text-xl font-semibold">Укупно заливања</h3>
          </div>
          <p className="text-2xl font-bold">{sessions.length}</p>
        </div>
      </div>
    </div>
  );
}