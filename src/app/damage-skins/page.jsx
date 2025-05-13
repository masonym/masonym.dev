"use client";
import { useState, useRef, useEffect } from 'react';
import { Settings, X, ChevronDown } from 'lucide-react';
import { skins } from './data';
import Mob from './Mob';
import DamageLine from './DamageLine';
import DamageConfigControls from './DamageConfigControls';

// Helper function to safely access localStorage
function getFromStorage(key, defaultValue) {
  // During server-side rendering, return default
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    
    // Parse JSON if the value looks like JSON
    if (item.startsWith('{') || item.startsWith('[')) {
      return JSON.parse(item);
    }
    
    // Convert to number if it's a numeric string
    if (!isNaN(item)) {
      return Number(item);
    }
    
    return item;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
}

export default function DamageSkins() {
  // Initialize state with lazy initializers that use the helper function
  const [selectedSkin, setSelectedSkin] = useState(() => 
    getFromStorage('selectedSkin', skins[0])
  );
  const [minDamage, setMinDamage] = useState(() => 
    getFromStorage('minDamage', 10000)
  );
  const [maxDamage, setMaxDamage] = useState(() => 
    getFromStorage('maxDamage', 1000000000)
  );
  const [linesCount, setLinesCount] = useState(() => 
    getFromStorage('linesCount', 1)
  );
  const [critRate, setCritRate] = useState(() => 
    getFromStorage('critRate', 60)
  );
  const [fadeDuration, setFadeDuration] = useState(() => 
    getFromStorage('fadeDuration', 2000)
  );
  
  const [isClient, setIsClient] = useState(false);
  const [damageLines, setDamageLines] = useState([]);
  const idRef = useRef(0);
  const [showSkinList, setShowSkinList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Mark when we're on the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  const simulateDamage = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  function handleClick() {
    const interval = 100;
    Array.from({ length: linesCount }).forEach((_, idx) => {
      setTimeout(() => {
        const dmg = simulateDamage(minDamage, maxDamage);
        const crit = Math.random() < (critRate / 100);
        const x = (Math.random() - 0.5) * 30;
        const y = idx * 32;
        const id = idRef.current++;
        const line = { id, damage: dmg, isCrit: crit, x, y };
        setDamageLines(prev => [...prev, line]);
        setTimeout(() => {
          setDamageLines(prev => prev.filter(l => l.id !== id));
        }, fadeDuration);
      }, idx * interval);
    });
  }

  // close modal on Escape key
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') setShowSettings(false);
    }
    if (showSettings) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showSettings]);

  // persist settings only on the client
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('selectedSkin', JSON.stringify(selectedSkin));
    }
  }, [selectedSkin, isClient]);
  
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('minDamage', minDamage);
    }
  }, [minDamage, isClient]);
  
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('maxDamage', maxDamage);
    }
  }, [maxDamage, isClient]);
  
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('linesCount', linesCount);
    }
  }, [linesCount, isClient]);
  
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('critRate', critRate);
    }
  }, [critRate, isClient]);
  
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('fadeDuration', fadeDuration);
    }
  }, [fadeDuration, isClient]);

  return (
    <div className="relative flex flex-col items-center justify-center h-screen">
      <div className="absolute top-4 left-4">
        <button onClick={() => setShowSkinList(v => !v)} className="flex items-center space-x-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded shadow-md dark:shadow-lg">
          <img src={selectedSkin.icon} alt={selectedSkin.name} className="w-6 h-6" />
          <span className="font-medium">{selectedSkin.name}</span>
          <ChevronDown className="w-4 h-4" />
        </button>
        {showSkinList && (
          <div className="mt-2 bg-white dark:bg-gray-800 shadow-md dark:shadow-lg rounded p-2 w-40">
            {skins.map(skin => (
              <div key={skin.id} onClick={() => { setSelectedSkin(skin); setShowSkinList(false); }} className="flex items-center space-x-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded">
                <img src={skin.icon} alt={skin.name} className="w-5 h-5" />
                <span className="text-sm text-gray-800 dark:text-gray-100">{skin.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="absolute top-4 right-4">
        <button onClick={() => setShowSettings(true)} className="p-2 bg-white dark:bg-gray-800 rounded shadow-md dark:shadow-lg">
          <Settings className="w-6 h-6 text-gray-900 dark:text-gray-100" />
        </button>
      </div>
      <Mob onClick={handleClick} />
      {damageLines.map(line => (
        <DamageLine key={line.id} {...line} skinPath={selectedSkin.path} fadeDuration={fadeDuration} />
      ))}
      {showSettings && (
        <div onClick={() => setShowSettings(false)} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div onClick={e => e.stopPropagation()} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl ring-1 ring-gray-200 dark:ring-gray-700 max-w-lg w-full mx-4 p-6 transform scale-95 animate-scale-up">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Settings</h2>
              <button onClick={() => setShowSettings(false)}>
                <X className="w-6 h-6 text-gray-900 dark:text-gray-100 hover:text-red-500" />
              </button>
            </div>
            <div className="border-b border-gray-200 dark:border-gray-700 mb-4" />
            <div className="space-y-6">
              <DamageConfigControls
                minDamage={minDamage}
                maxDamage={maxDamage}
                linesCount={linesCount}
                critRate={critRate}
                fadeDuration={fadeDuration}
                onChange={({ min, max, lines, crit }) => {
                  setMinDamage(min);
                  setMaxDamage(max);
                  setLinesCount(lines);
                  setCritRate(crit);
                }}
                onFadeChange={setFadeDuration}
              />
            </div>
          </div>
        </div>
      )}
      <style jsx global>{`
        /* remove default number input spinners */
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
        @keyframes moveUpFade {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(-50px); opacity: 0; }
        }
        @keyframes scale-up {
          0% { transform: scale(0.95); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-scale-up {
          animation: scale-up 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}