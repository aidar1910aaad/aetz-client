'use client';

import { useState, useMemo, useEffect } from 'react';
import { FaSearch, FaTruck, FaRedo } from 'react-icons/fa';
import { MdWork, MdEngineering, MdElectricalServices, MdBuild } from 'react-icons/md';
import { useWorksStore } from '@/store/useWorksStore';
import type { WorkItem } from '@/store/useWorksStore';

const categories = [
  {
    title: 'Монтаж оборудования ТП',
    key: 'installation',
    icon: <MdEngineering className="w-6 h-6 text-blue-500" />,
    items: [
      { name: 'Монтаж БМЗ (за один блок)', price: 26000, unit: 'блок' },
      { name: 'Монтаж контура заземления', price: 19000, unit: 'шт' },
      { name: 'Монтаж РУ-10-20кВ с ШРЗ (за одну ячейку)', price: 28000, unit: 'ячейка' },
      { name: 'Монтаж РУ-0,4кВ (за одну панель)', price: 24000, unit: 'панель' },
      { name: 'Монтаж силового трансформатора (до 630кВА)', price: 30000, unit: 'шт' },
      { name: 'Монтаж силового трансформатора (до 1600кВА)', price: 40000, unit: 'шт' },
      { name: 'Монтаж силового трансформатора (2500-3150кВА)', price: 50000, unit: 'шт' },
      { name: 'Монтаж трансформаторного узла 10-20кВ (кабель)', price: 50000, unit: 'шт' },
      { name: 'Монтаж трансформаторного узла 0,4кВ МТ (одинарная до 10*100)', price: 75000, unit: 'шт' },
      { name: 'Монтаж трансформаторного узла 0,4кВ МТ (двойная до 10*100)', price: 133000, unit: 'шт' },
      { name: 'Монтаж трансформаторного узла 0,4кВ МТ (тройная до 10*100)', price: 173000, unit: 'шт' },
      { name: 'Монтаж трансформаторного узла 0,4кВ МТ (одинарная до 10*120)', price: 87000, unit: 'шт' },
      { name: 'Монтаж трансформаторного узла 0,4кВ МТ (двойная до 10*120)', price: 138000, unit: 'шт' },
      { name: 'Монтаж трансформаторного узла 0,4кВ МТ (тройная до 10*120)', price: 190000, unit: 'шт' },
      { name: 'Монтаж трансформаторного узла 0,4кВ МТ (одинарная до 10*160)', price: 100000, unit: 'шт' },
      { name: 'Монтаж трансформаторного узла 0,4кВ МТ (двойная до 10*160)', price: 159000, unit: 'шт' },
      { name: 'Монтаж трансформаторного узла 0,4кВ МТ (тройная до 10*160)', price: 219000, unit: 'шт' },
      { name: 'Монтаж трансформаторного узла 0,4кВ АД (одинарная до 10*100)', price: 58000, unit: 'шт' },
      { name: 'Монтаж трансформаторного узла 0,4кВ АД (двойная до 10*100)', price: 104000, unit: 'шт' },
      { name: 'Монтаж трансформаторного узла 0,4кВ АД (тройная до 10*100)', price: 144000, unit: 'шт' },
      { name: 'Монтаж трансформаторного узла 0,4кВ АД (одинарная до 10*120)', price: 70000, unit: 'шт' },
      { name: 'Монтаж трансформаторного узла 0,4кВ АД (двойная до 10*120)', price: 111000, unit: 'шт' },
      { name: 'Монтаж трансформаторного узла 0,4кВ АД (тройная до 10*120)', price: 173000, unit: 'шт' },
      { name: 'Монтаж трансформаторного узла 0,4кВ АД (одинарная до 10*160)', price: 72000, unit: 'шт' },
      { name: 'Монтаж трансформаторного узла 0,4кВ АД (двойная до 10*160)', price: 115000, unit: 'шт' },
      { name: 'Монтаж трансформаторного узла 0,4кВ АД (тройная до 10*160)', price: 176000, unit: 'шт' },
      { name: 'Монтаж ДГУ (до 300кВА)', price: 100000, unit: 'шт' },
      { name: 'Монтаж ДГУ (до 500кВА)', price: 145000, unit: 'шт' },
      { name: 'Монтаж ДГУ (до 750кВА)', price: 200000, unit: 'шт' },
      { name: 'Монтаж панелей ДГУ (комплект)', price: 35000, unit: 'компл' },
      { name: 'Монтаж КТП (до 1000кВА)', price: 115000, unit: 'шт' },
      { name: 'Монтаж КТП (1600-2500кВА)', price: 135000, unit: 'шт' },
      { name: 'Монтаж ЯКНО', price: 115000, unit: 'шт' },
      { name: 'Монтаж КТП с ФБС-2шт', price: 115000, unit: 'шт' },
      { name: 'Монтаж одной ячейки 10-20кВ в действующий РП/ТП', price: 166000, unit: 'ячейка' },
      { name: 'Монтаж освещения, отопления в кирпичном здании ТП без ДГУ', price: 200000, unit: 'шт' },
      { name: 'Монтаж освещения, отопления в кирпичном здании ТП с ДГУ', price: 250000, unit: 'шт' },
      { name: 'Монтаж освещения, отопления в кирпичном здании РП', price: 300000, unit: 'шт' },
      { name: 'Монтаж кабельных металлических стоек и полок', price: 75000, unit: 'шт' },
      { name: 'Сбор, оформление, подписание исполнительной и технической документации', price: 100000, unit: 'компл' },
      { name: 'Изготовление, монтаж ШМ 0,4кВ без металла (одинарная)', price: 46000, unit: 'шт' },
      { name: 'Изготовление, монтаж ШМ 0,4кВ без металла (двойная)', price: 69000, unit: 'шт' },
      { name: 'Изготовление, монтаж ШМ 0,4кВ без металла (тройная)', price: 104000, unit: 'шт' },
      { name: 'Монтаж внутреннего контура заземления (с ДГУ)', price: 50000, unit: 'шт' },
      { name: 'Монтаж внутреннего контура заземления (без ДГУ)', price: 40000, unit: 'шт' },
      { name: 'Изготовление, монтаж ШМ 10/20кВ', price: 80000, unit: 'шт' },
    ],
  },
  {
    title: 'Услуги',
    key: 'services',
    icon: <MdElectricalServices className="w-6 h-6 text-green-500" />,
    items: [
      { name: 'Пусконаладка - Наша ячейка РУ-10кВ', price: 80000, unit: 'шт' },
      { name: 'Пусконаладка - Чужая ячейка РУ-10кВ', price: 150000, unit: 'шт' },
      { name: 'Пусконаладка - РУ-0,4кВ (АВР)', price: 200000, unit: 'шт' },
      { name: 'Расчёт уставки РЗ (на две секции)', price: 105000, unit: 'расчет' },
      { name: 'ЭТЛ', price: 100000, unit: 'шт' },
      { name: 'Отключение секции', price: 300000, unit: 'секция' },
    ],
  },
  {
    title: 'Дополнительные монтажные работы',
    key: 'additional',
    icon: <MdBuild className="w-6 h-6 text-orange-500" />,
    items: [
      { name: 'Монтаж контура заземления ТП в зимнее время', price: 750000, unit: 'шт' },
      { name: 'Монтаж контура заземления ТП в летнее время', price: 500000, unit: 'шт' },
      { name: 'Монтаж контура заземления БКТП в зимнее время (наружный)', price: 600000, unit: 'шт' },
      { name: 'Монтаж контура заземления ТП в летнее время (наружный)', price: 350000, unit: 'шт' },
      { name: 'Монтаж внутреннего контура заземления', price: 1650, unit: 'м.пог' },
      { name: 'Монтаж освещения, отопления', price: 9800, unit: 'кв.м' },
      { name: 'Монтаж фундамента (с материалами)', price: 50000, unit: 'кв.м' },
      { name: 'Монтаж временного КТП', price: 600000, unit: 'компл' },
      { name: 'Монтаж временного ЯКНО', price: 190000, unit: 'компл' },
      { name: 'Сдача, включение под напряжение, согласование в АО Астана РЭК', price: 650000, unit: 'компл' },
    ],
  },
  {
    title: 'Транспортные расходы',
    key: 'transport',
    icon: <FaTruck className="w-6 h-6 text-purple-500" />,
    items: [
      { name: 'Доставка оборудования', price: 25000, unit: 'раб.' },
      { name: 'Командировочные расходы', price: 3932, unit: 'МРП' },
      { name: 'Проживание на день', price: 30000, unit: 'день' },
    ],
  },
];

export default function WorkSelector() {
  const selected = useWorksStore((s) => s.selected);
  const setSelected = useWorksStore((s) => s.setSelected);
  const setWorksList = useWorksStore((s) => s.setWorksList);
  const [open, setOpen] = useState<{ [key: string]: boolean }>({ 
    installation: true, 
    services: true, 
    additional: true, 
    transport: true 
  });
  const [search, setSearch] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Принудительно обновляем store при каждом рендере
  useEffect(() => {
    const worksData = categories.flatMap((cat) => cat.items) as WorkItem[];
    setWorksList(worksData);
    console.log('Work data updated:', worksData);
  }, []);

  // Функция для принудительного обновления
  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    window.location.reload();
  };

  // Фильтрация по поиску
  const filteredCategories = useMemo(
    () =>
      categories.map((cat) => ({
        ...cat,
        items: cat.items.filter((item) => item.name.toLowerCase().includes(search.toLowerCase())),
      })),
    [search]
  );

  const handleCheck = (name: string, checked: boolean) => {
    setSelected({
      ...selected,
      [name]: {
        checked,
        count: selected[name]?.count || 1,
      },
    });
  };

  const handleCount = (name: string, count: number) => {
    setSelected({
      ...selected,
      [name]: {
        ...selected[name],
        count: count < 1 ? 1 : count,
      },
    });
  };

  const increment = (name: string) => {
    handleCount(name, (selected[name]?.count || 1) + 1);
  };
  const decrement = (name: string) => {
    handleCount(name, (selected[name]?.count || 1) - 1);
  };

  return (
    <div key={refreshKey}>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Работы и транспортные расходы</h1>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          <FaRedo className="w-4 h-4" />
          Обновить
        </button>
      </div>
      <div className="max-w-3xl mx-auto mb-8">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-400"
            placeholder="Поиск..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        {filteredCategories.map((cat) => (
          <div key={cat.key} className="bg-white border border-gray-200 rounded-2xl shadow-sm">
            <button
              className="w-full flex items-center justify-between px-6 py-4 font-bold text-lg text-gray-900 rounded-t-2xl bg-gray-50 hover:bg-gray-100 transition group"
              onClick={() => setOpen((prev) => ({ ...prev, [cat.key]: !prev[cat.key] }))}
              type="button"
            >
              <span className="flex items-center gap-3">
                {cat.icon}
                {cat.title}
              </span>
              <span
                className={`transform transition-transform duration-200 ${
                  open[cat.key] ? 'rotate-180' : ''
                }`}
              >
                <svg
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </span>
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                open[cat.key] ? 'max-h-[2000px] py-4' : 'max-h-0 py-0'
              }`}
            >
              <div className="grid grid-cols-1 gap-4 px-4 md:grid-cols-2">
                {cat.items.length === 0 && (
                  <div className="text-gray-400 italic col-span-2">Нет позиций</div>
                )}
                {cat.items.map((item) => {
                  const isChecked = !!selected[item.name]?.checked;
                  return (
                    <div
                      key={item.name}
                      className={`flex flex-col justify-between h-full border rounded-xl p-4 shadow-sm transition-all duration-200 bg-white hover:shadow-md cursor-pointer group
                        ${
                          isChecked
                            ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50'
                            : 'border-gray-200'
                        }`}
                      onClick={() => handleCheck(item.name, !isChecked)}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleCheck(item.name, e.target.checked)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:border-blue-500 transition"
                        />
                        <span className="font-semibold text-gray-900 text-base">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-4 justify-between mt-2">
                        <div className="flex items-center gap-2">
                          {isChecked && (
                            <>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  decrement(item.name);
                                }}
                                className="w-8 h-8 rounded-lg border border-gray-300 bg-gray-100 hover:bg-blue-100 text-lg font-bold flex items-center justify-center transition"
                              >
                                –
                              </button>
                              <input
                                type="number"
                                min={1}
                                value={selected[item.name]?.count || 1}
                                onChange={(e) => handleCount(item.name, Number(e.target.value))}
                                onClick={(e) => e.stopPropagation()}
                                className="w-14 text-center border border-gray-300 px-2 py-1 rounded-lg text-base focus:ring-2 focus:ring-blue-300"
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  increment(item.name);
                                }}
                                className="w-8 h-8 rounded-lg border border-gray-300 bg-gray-100 hover:bg-blue-100 text-lg font-bold flex items-center justify-center transition"
                              >
                                +
                              </button>
                            </>
                          )}
                        </div>
                        <div className="flex flex-col items-end min-w-[90px]">
                          {item.price && (
                            <span className="text-gray-700 font-semibold text-base">
                              {item.price.toLocaleString()}₸
                            </span>
                          )}
                          {item.unit && <span className="text-gray-500 text-xs">{item.unit}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
