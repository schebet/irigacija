import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Wifi, WifiOff, Smartphone, Wrench, Upload, Download, Zap, Gauge } from 'lucide-react';

export function Settings() {
  const [isConnected, setIsConnected] = useState(false);
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [deviceIp, setDeviceIp] = useState('');
  const [scanning, setScanning] = useState(false);
  const [networks, setNetworks] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'connection' | 'setup' | 'valves' | 'pressure'>('setup');

  // Funkcija za skeniranje WiFi mreža
  const scanNetworks = async () => {
    setScanning(true);
    try {
      const response = await fetch(`http://${deviceIp}/scan`);
      const data = await response.json();
      setNetworks(data.networks);
    } catch (error) {
      console.error('Грешка при скенирању мрежа:', error);
    }
    setScanning(false);
  };

  // Funkcija za povezivanje sa ESP8266
  const connectToESP = async () => {
    try {
      const response = await fetch(`http://${deviceIp}/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ssid, password }),
      });
      
      if (response.ok) {
        setIsConnected(true);
        localStorage.setItem('deviceIp', deviceIp);
      }
    } catch (error) {
      console.error('Грешка при повезивању:', error);
    }
  };

  // Proveri status povezanosti pri učitavanju
  useEffect(() => {
    const savedIp = localStorage.getItem('deviceIp');
    if (savedIp) {
      setDeviceIp(savedIp);
      fetch(`http://${savedIp}/status`)
        .then(response => response.json())
        .then(data => setIsConnected(data.connected))
        .catch(() => setIsConnected(false));
    }
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Подешавања</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex border-b">
          <button
            className={`flex-1 px-6 py-3 text-center ${
              activeTab === 'setup'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('setup')}
          >
            <div className="flex items-center justify-center gap-2">
              <Wrench className="w-5 h-5" />
              <span>Упутство за подешавање</span>
            </div>
          </button>
          <button
            className={`flex-1 px-6 py-3 text-center ${
              activeTab === 'connection'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('connection')}
          >
            <div className="flex items-center justify-center gap-2">
              <Wifi className="w-5 h-5" />
              <span>WiFi повезивање</span>
            </div>
          </button>
          <button
            className={`flex-1 px-6 py-3 text-center ${
              activeTab === 'valves'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('valves')}
          >
            <div className="flex items-center justify-center gap-2">
              <Zap className="w-5 h-5" />
              <span>Електро вентили</span>
            </div>
          </button>
          <button
            className={`flex-1 px-6 py-3 text-center ${
              activeTab === 'pressure'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('pressure')}
          >
            <div className="flex items-center justify-center gap-2">
              <Gauge className="w-5 h-5" />
              <span>Сензор притиска</span>
            </div>
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'setup' ? (
            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold mb-4">Инсталација Arduino IDE</h2>
                <ol className="list-decimal list-inside space-y-4">
                  <li className="pl-4">
                    <span className="font-medium">Преузимање Arduino IDE</span>
                    <p className="mt-1 text-gray-600">
                      Посетите <a href="https://www.arduino.cc/en/software" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">званични сајт</a> и преузмите најновију верзију Arduino IDE за ваш оперативни систем.
                    </p>
                  </li>
                  <li className="pl-4">
                    <span className="font-medium">Подешавање за ESP8266</span>
                    <div className="mt-2 bg-gray-50 p-4 rounded-md">
                      <ol className="list-decimal list-inside space-y-2 text-sm">
                        <li>Отворите Arduino IDE</li>
                        <li>Идите на File → Preferences</li>
                        <li>У поље "Additional Boards Manager URLs" додајте:</li>
                        <code className="block bg-gray-100 p-2 mt-2 rounded text-sm">
                          http://arduino.esp8266.com/stable/package_esp8266com_index.json
                        </code>
                      </ol>
                    </div>
                  </li>
                  <li className="pl-4">
                    <span className="font-medium">Инсталација ESP8266 подршке</span>
                    <div className="mt-2 bg-gray-50 p-4 rounded-md">
                      <ol className="list-decimal list-inside space-y-2 text-sm">
                        <li>Идите на Tools → Board → Boards Manager</li>
                        <li>Претражите "ESP8266"</li>
                        <li>Инсталирајте "ESP8266 by ESP8266 Community"</li>
                      </ol>
                    </div>
                  </li>
                  <li className="pl-4">
                    <span className="font-medium">Инсталација библиотека</span>
                    <div className="mt-2 bg-gray-50 p-4 rounded-md">
                      <ol className="list-decimal list-inside space-y-2 text-sm">
                        <li>Идите на Tools → Manage Libraries</li>
                        <li>Инсталирајте следеће библиотеке:</li>
                        <ul className="list-disc list-inside ml-4 mt-2">
                          <li>ESP8266WiFi</li>
                          <li>ESP8266WebServer</li>
                          <li>ArduinoJson</li>
                          <li>ESP8266mDNS</li>
                        </ul>
                      </ol>
                    </div>
                  </li>
                </ol>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">Ограничења ESP8266 NodeMCU</h2>
                <div className="bg-gray-50 p-4 rounded-md space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Доступни GPIO пинови</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                      <li>D1 (GPIO5)</li>
                      <li>D2 (GPIO4)</li>
                      <li>D3 (GPIO0)</li>
                      <li>D4 (GPIO2)</li>
                      <li>D5 (GPIO14)</li>
                      <li>D6 (GPIO12)</li>
                      <li>D7 (GPIO13)</li>
                      <li>D8 (GPIO15)</li>
                      <li>RX (GPIO3)</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Максимални број релеја</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                      <li>Препоручено: 4-8 релеја</li>
                      <li>Максимално: 8-9 GPIO пинова за дигиталне излазе</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Ограничења напајања</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                      <li>Потрошња по релеју: ~20mA</li>
                      <li>3.3V регулатор: поуздано напаја 4-6 релеја</li>
                      <li>За више релеја потребно:</li>
                      <ul className="list-disc list-inside ml-4 space-y-1">
                        <li>Посебно напајање за релеј модул</li>
                        <li>Оптичко одвајање контролних сигнала</li>
                      </ul>
                    </ul>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-md mt-4">
                    <h3 className="font-medium mb-2 text-blue-800">Препорука</h3>
                    <p className="text-sm text-blue-700">
                      За оптималан и поуздан рад система за наводњавање, најбоље је користити 4-канални или 8-канални релеј модул, уз обавезно посебно напајање за релеје.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">Upload кода на ESP8266</h2>
                <ol className="list-decimal list-inside space-y-4">
                  <li className="pl-4">
                    <span className="font-medium">Подешавање плоче</span>
                    <div className="mt-2 bg-gray-50 p-4 rounded-md">
                      <ol className="list-decimal list-inside space-y-2 text-sm">
                        <li>Изаберите: Tools → Board → ESP8266 Boards → NodeMCU 1.0</li>
                        <li>Подесите параметре:</li>
                        <ul className="list-disc list-inside ml-4 mt-2">
                          <li>Upload Speed: 115200</li>
                          <li>CPU Frequency: 80 MHz</li>
                          <li>Flash Size: 4MB (FS:2MB OTA:~1019KB)</li>
                        </ul>
                      </ol>
                    </div>
                  </li>
                  <li className="pl-4">
                    <span className="font-medium">Повезивање ESP8266</span>
                    <p className="mt-1 text-gray-600">
                      Повежите ESP8266 на рачунар преко USB кабла и изаберите одговарајући порт у Arduino IDE (Tools → Port).
                    </p>
                  </li>
                  <li className="pl-4">
                    <span className="font-medium">Upload кода</span>
                    <div className="mt-2 bg-gray-50 p-4 rounded-md">
                      <ol className="list-decimal list-inside space-y-2 text-sm">
                        <li>Отворите .ino фајл у Arduino IDE</li>
                        <li>Проверите WiFi креденцијале у коду</li>
                        <li>Кликните на дугме "Upload"</li>
                        <li>Сачекајте да се заврши upload</li>
                      </ol>
                    </div>
                  </li>
                </ol>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">Повезивање хардвера</h2>
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium mb-2">Дијаграм повезивања</h3>
                  <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`ESP8266 NodeMCU     Релеј модул          Сензор влажности
+------------+     +------------+        +------------+
| 3.3V    -->|     |VCC         |        |VCC         |
| GND     -->|     |GND         |        |GND         |
| D1      -->|     |IN1         |        |            |
| D2      -->|     |IN2         |        |            |
| D3      -->|     |IN3         |        |            |
| D4      -->|     |IN4         |        |            |
| A0      -->|     |            |        |AO          |
+------------+     +------------+        +------------+`}
                  </pre>
                </div>
              </section>
            </div>
          ) : activeTab === 'connection' ? (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Smartphone className="w-6 h-6 text-gray-600" />
                <h2 className="text-xl font-semibold">Упутство за повезивање</h2>
              </div>
              
              <div className="space-y-4 mb-8 bg-blue-50 p-4 rounded-lg">
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                  <li>Укључите мобилни хотспот на вашем телефону</li>
                  <li>Повежите се на "IrrigationSystem" WiFi мрежу са другог уређаја</li>
                  <li>Унесите IP адресу уређаја (обично 192.168.4.1)</li>
                  <li>Скенирајте доступне мреже</li>
                  <li>Изаберите ваш мобилни хотспот из листе</li>
                  <li>Унесите лозинку вашег хотспота</li>
                  <li>Кликните на "Повежи се"</li>
                </ol>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  {isConnected ? (
                    <Wifi className="w-5 h-5 text-green-500" />
                  ) : (
                    <WifiOff className="w-5 h-5 text-red-500" />
                  )}
                  <span className="text-sm">
                    {isConnected ? 'Повезано' : 'Није повезано'}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="deviceIp" className="text-sm font-medium text-gray-700">
                    IP адреса уређаја
                  </label>
                  <input
                    type="text"
                    id="deviceIp"
                    value={deviceIp}
                    onChange={(e) => setDeviceIp(e.target.value)}
                    placeholder="нпр. 192.168.4.1"
                    className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="ssid" className="text-sm font-medium text-gray-700">
                    Изаберите ваш мобилни хотспот
                  </label>
                  <select
                    id="ssid"
                    value={ssid}
                    onChange={(e) => setSsid(e.target.value)}
                    className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Изаберите мрежу</option>
                    {networks.map((network) => (
                      <option key={network} value={network}>
                        {network}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={scanNetworks}
                    disabled={scanning}
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
                  >
                    {scanning ? 'Скенирање...' : 'Скенирај мреже'}
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Лозинка хотспота
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={connectToESP}
                  disabled={!ssid || !password || !deviceIp}
                  className="w-full mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400"
                >
                  Повежи се
                </button>
              </div>
            </div>
          ) : activeTab === 'valves' ? (
            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold mb-4">Повезивање електро вентила</h2>
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="font-medium mb-3">Компоненте</h3>
                    <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                      <li>ESP8266 NodeMCU</li>
                      <li>Релеј модул (број канала зависи од броја вентила)</li>
                      <li>12V DC соленоидни вентили</li>
                      <li>12V DC напајање</li>
                      <li>Каблови за повезивање</li>
                      <li>Осигурачи (опционо, али препоручено)</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="font-medium mb-3">Кораци за повезивање</h3>
                    <ol className="list-decimal list-inside space-y-3 text-sm text-gray-700">
                      <li className="pl-4">
                        <span className="font-medium">Напајање релеј модула</span>
                        <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                          <li>Повежите VCC релеја на 3.3V пин ESP8266</li>
                          <li>Повежите GND релеја на GND пин ESP8266</li>
                        </ul>
                      </li>
                      <li className="pl-4">
                        <span className="font-medium">Контролни сигнали</span>
                        <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                          <li>IN1 релеја → D1 (GPIO5) ESP8266</li>
                          <li>IN2 релеја → D2 (GPIO4) ESP8266</li>
                          <li>IN3 релеја → D3 (GPIO0) ESP8266</li>
                          <li>IN4 релеја → D4 (GPIO2) ESP8266</li>
                        </ul>
                      </li>
                      <li className="pl-4">
                        <span className="font-medium">Повезивање вентила</span>
                        <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                          <li>Повежите + вентила на NO (Normally Open) контакт релеја</li>
                          <li>Повежите - вентила на - 12V напајања</li>
                          <li>Повежите COM релеја на + 12V напајања</li>
                        </ul>
                      </li>
                      <li className="pl-4">
                        <span className="font-medium">Сигурносне мере</span>
                        <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                          <li>Поставите осигураче на + линију сваког вентила</li>
                          <li>Изолујте све спојеве водоотпорном изолацијом</li>
                          <li>Поставите компоненте у водоотпорно кућиште</li>
                        </ul>
                      </li>
                    </ol>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="font-medium mb-3">Дијаграм повезивања вентила</h3>
                    <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`12V Напајање      Релеј модул          Вентил
+------------+     +------------+     +------------+
| +12V    -->|     |COM         |     |+          |
| GND     -->|     |NO       -->|     |-          |
+------------+     |NC          |     +------------+
                   +------------+`}
                    </pre>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-md">
                    <h3 className="font-medium mb-3 text-yellow-800">Важне напомене</h3>
                    <ul className="list-disc list-inside space-y-2 text-sm text-yellow-700">
                      <li>Проверите напон и поларитет пре повезивања</li>
                      <li>Користите каблове одговарајућег пресека</li>
                      <li>Тестирајте сваки вентил појединачно пре финалне инсталације</li>
                      <li>Обезбедите адекватно хлађење за напајање</li>
                      <li>Редовно проверавајте спојеве и изолацију</li>
                    </ul>
                  </div>
                </div>
              </section>
            </div>
          ) : (
            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-semibold mb-4">Сензор притиска воде</h2>
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="font-medium mb-3">Компоненте</h3>
                    <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                      <li>Сензор притиска воде (0-10 bar)</li>
                      <li>ESP8266 NodeMCU</li>
                      <li>Каблови за повезивање</li>
                      <li>Водоотпорно кућиште</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="font-medium mb-3">Повезивање сензора</h3>
                    <ol className="list-decimal list-inside space-y-3 text-sm text-gray-700">
                      <li className="pl-4">
                        <span className="font-medium">Напајање сензора</span>
                        <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                          <li>VCC сензора → 3.3V ESP8266</li>
                          <li>GND сензора → GND ESP8266</li>
                        </ul>
                      </li>
                      <li className="pl-4">
                        <span className="font-medium">Аналогни излаз</span>
                        <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                          <li>OUT сензора → A0 ESP8266</li>
                        </ul>
                      </li>
                    </ol>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="font-medium mb-3">Дијаграм повезивања</h3>
                    <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`ESP8266 NodeMCU     Сензор притиска
+------------+     +------------+
| 3.3V    -->|     |VCC         |
| GND     -->|     |GND         |
| A0      -->|     |OUT         |
+------------+     +------------+`}
                    </pre>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-md">
                    <h3 className="font-medium mb-3 text-blue-800">Калибрација</h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700">
                      <li>Повежите сензор на водоводну мрежу</li>
                      <li>Измерите стварни притисак воде манометром</li>
                      <li>Упоредите очитавање сензора са манометром</li>
                      <li>Подесите калибрационе параметре у коду</li>
                    </ol>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-md">
                    <h3 className="font-medium mb-3 text-yellow-800">Важне напомене</h3>
                    <ul className="list-disc list-inside space-y-2 text-sm text-yellow-700">
                      <li>Користите сензор одговарајућег опсега (0-10 bar)</li>
                      <li>Обезбедите водонепропусно кућиште</li>
                      <li>Редовно проверавајте заптивање</li>
                      <li>Калибришите сензор периодично</li>
                    </ul>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}