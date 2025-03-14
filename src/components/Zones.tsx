import React, { useState, useEffect } from 'react';
import { useIrrigationStore } from '../store/irrigationStore';
import { Plus, Clock, Calendar, Trash2, Droplets } from 'lucide-react';

export function Zones() {
  const { zones, addZone, addSchedule, removeSchedule } = useIrrigationStore();
  const [newZoneName, setNewZoneName] = useState('');
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [newSchedule, setNewSchedule] = useState({
    startTime: '06:00',
    duration: 30,
    days: [] as number[]
  });

  // Simulacija očitavanja senzora (u pravoj implementaciji, ovo bi bili podaci sa ESP8266)
  useEffect(() => {
    const interval = setInterval(() => {
      zones.forEach(zone => {
        // Simuliramo random promene u vlažnosti
        const randomChange = Math.random() * 2 - 1; // -1 do 1
        const newMoisture = Math.max(0, Math.min(100, zone.moisture + randomChange));
        useIrrigationStore.getState().updateMoisture(zone.id, newMoisture);
      });
    }, 5000); // Ažuriranje na svakih 5 sekundi

    return () => clearInterval(interval);
  }, [zones]);

  const handleAddZone = () => {
    if (newZoneName.trim()) {
      addZone({
        id: crypto.randomUUID(),
        name: newZoneName,
        active: false,
        schedule: [],
        moisture: Math.random() * 100, // Početna random vrednost
        moistureHistory: []
      });
      setNewZoneName('');
    }
  };

  const handleAddSchedule = (zoneId: string) => {
    if (newSchedule.days.length > 0) {
      addSchedule({
        id: crypto.randomUUID(),
        zoneId,
        startTime: newSchedule.startTime,
        duration: newSchedule.duration,
        days: newSchedule.days,
        active: true
      });
      setNewSchedule({ startTime: '06:00', duration: 30, days: [] });
    }
  };

  const toggleDay = (day: number) => {
    setNewSchedule(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  };

  const getMoistureColor = (moisture: number) => {
    if (moisture < 30) return 'text-red-500';
    if (moisture < 60) return 'text-yellow-500';
    return 'text-green-500';
  };

  const daysOfWeek = [
    'Недеља', 'Понедељак', 'Уторак', 'Среда', 'Четвртак', 'Петак', 'Субота'
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Зоне заливања</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Додај нову зону</h2>
        <div className="flex gap-4">
          <input
            type="text"
            value={newZoneName}
            onChange={(e) => setNewZoneName(e.target.value)}
            placeholder="Име зоне"
            className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddZone}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            <Plus className="w-5 h-5" />
            <span>Додај</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {zones.map((zone) => (
          <div key={zone.id} className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-semibold">{zone.name}</h3>
                  <div className="flex items-center gap-2">
                    <Droplets className={`w-5 h-5 ${getMoistureColor(zone.moisture)}`} />
                    <span className={`font-medium ${getMoistureColor(zone.moisture)}`}>
                      {Math.round(zone.moisture)}%
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedZone(selectedZone === zone.id ? null : zone.id)}
                  className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md"
                >
                  <Clock className="w-5 h-5" />
                  <span>Распоред</span>
                </button>
              </div>
              <div className="mt-4 text-gray-600">
                <p>Активни распореди: {zone.schedule.filter(s => s.active).length}</p>
                <p>Статус: {zone.active ? 'Активна' : 'Неактивна'}</p>
              </div>

              {/* График историје влажности */}
              {zone.moistureHistory.length > 0 && (
                <div className="mt-4 h-24 flex items-end gap-1">
                  {zone.moistureHistory.map((reading, index) => (
                    <div
                      key={index}
                      className={`w-1 ${getMoistureColor(reading.value)}`}
                      style={{
                        height: `${reading.value}%`,
                        minHeight: '4px',
                        backgroundColor: 'currentColor'
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {selectedZone === zone.id && (
              <div className="p-6 bg-gray-50">
                <h4 className="font-semibold mb-4">Додај нови распоред</h4>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Време почетка
                      </label>
                      <input
                        type="time"
                        value={newSchedule.startTime}
                        onChange={(e) => setNewSchedule(prev => ({ ...prev, startTime: e.target.value }))}
                        className="w-full px-4 py-2 border rounded-md"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Трајање (минути)
                      </label>
                      <input
                        type="number"
                        value={newSchedule.duration}
                        onChange={(e) => setNewSchedule(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                        min="1"
                        className="w-full px-4 py-2 border rounded-md"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Дани у недељи
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {daysOfWeek.map((day, index) => (
                        <button
                          key={day}
                          onClick={() => toggleDay(index)}
                          className={`px-3 py-1 rounded-full text-sm ${
                            newSchedule.days.includes(index)
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddSchedule(zone.id)}
                    disabled={newSchedule.days.length === 0}
                    className="w-full mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400"
                  >
                    Сачувај распоред
                  </button>
                </div>

                {zone.schedule.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-4">Постојећи распореди</h4>
                    <div className="space-y-3">
                      {zone.schedule.map((schedule) => (
                        <div
                          key={schedule.id}
                          className="flex items-center justify-between bg-white p-4 rounded-md border"
                        >
                          <div>
                            <p className="font-medium">{schedule.startTime}</p>
                            <p className="text-sm text-gray-600">
                              {schedule.duration} минута | {schedule.days.map(d => daysOfWeek[d].slice(0, 3)).join(', ')}
                            </p>
                          </div>
                          <button
                            onClick={() => removeSchedule(zone.id, schedule.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}