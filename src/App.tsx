import React, { useState, useEffect } from 'react';
import { AlarmConfig } from './utils/fajrLogic';
import { MainScreen } from './components/MainScreen';
import { AlarmSetupFlow } from './components/AlarmSetupFlow';
import { AlarmEditScreen } from './components/AlarmEditScreen';
import { RingingScreen } from './components/RingingScreen';
import { FlutterTechSpec } from './components/FlutterTechSpec';
import { useTheme } from './themeContext';
import { Moon, Sun, BookCheck, Smartphone } from 'lucide-react';

const DEFAULT_CONFIG: AlarmConfig = {
  fajrTime: '04:52',
  offsetMinutes: -15,
  wakeUpTime: '04:37',
  missionType: 'tasbih',
  tasbihCount: 5,
  tasbihPhrase: 'سُبْحَانَ اللَّهِ',
  religiousQuestionsCount: 2,
  mathQuestionsCount: 2,
  mathDifficulty: 'medium',
  selectedToneId: 'tone_qom',
  isEnabled: true,
  city: 'مكة المكرمة',
  barcodeValue: 'WUDU-TOOTHPASTE-786',
  barcodeLabel: 'معجون الأسنان بالحمام 🪥',
};

export default function App() {
  const { theme, toggleTheme } = useTheme();

  const [config, setConfig] = useState<AlarmConfig | null>(() => {
    const saved = localStorage.getItem('fajr_alarm_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.selectedToneId) {
          parsed.selectedToneId = 'tone_qom';
        }
        return parsed;
      } catch {
        return DEFAULT_CONFIG;
      }
    }
    return DEFAULT_CONFIG;
  });

  const [activeTab, setActiveTab] = useState<'app' | 'techSpec'>('app');
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isRinging, setIsRinging] = useState(false);

  useEffect(() => {
    if (config) {
      localStorage.setItem('fajr_alarm_config', JSON.stringify(config));
    } else {
      localStorage.removeItem('fajr_alarm_config');
    }
  }, [config]);

  const handleSaveConfig = (newConfig: AlarmConfig) => {
    setConfig(newConfig);
    setIsSetupOpen(false);
  };

  const handleToggleAlarm = () => {
    if (!config) return;
    setConfig({
      ...config,
      isEnabled: !config.isEnabled,
    });
  };

  const handleResetToEmpty = () => {
    setConfig(null);
    setIsSetupOpen(false);
  };

  const handleRestoreDefaults = () => {
    setConfig(DEFAULT_CONFIG);
  };

  const isDark = theme === 'dark';

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        isDark
          ? 'bg-slate-950 text-slate-100 selection:bg-emerald-500/20'
          : 'bg-slate-50 text-slate-800 selection:bg-emerald-200'
      }`}
    >
      {/* Top Navbar */}
      <header
        className={`border-b sticky top-0 z-30 transition-colors backdrop-blur-md ${
          isDark
            ? 'border-slate-800/80 bg-slate-950/80'
            : 'border-slate-200/90 bg-white/85 shadow-xs'
        }`}
      >
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                isDark
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                  : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
              }`}
            >
              <Moon className="w-4 h-4" />
            </div>
            <span
              className={`font-bold text-base tracking-wide ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              منبه الفجر
            </span>
          </div>

          {/* Navigation Tabs & Theme Switcher */}
          <div className="flex items-center gap-2">
            <nav
              className={`flex items-center gap-1 p-1 rounded-xl border ${
                isDark
                  ? 'bg-slate-900 border-slate-800'
                  : 'bg-slate-100 border-slate-200'
              }`}
            >
              <button
                onClick={() => setActiveTab('app')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'app'
                    ? isDark
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white text-emerald-800 shadow-sm'
                    : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>واجهة التطبيق</span>
              </button>

              <button
                onClick={() => setActiveTab('techSpec')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'techSpec'
                    ? isDark
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white text-emerald-800 shadow-sm'
                    : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookCheck className="w-3.5 h-3.5" />
                <span>المواصفات (Flutter)</span>
              </button>
            </nav>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label={isDark ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع المظلم'}
              title={isDark ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع المظلم'}
              className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-amber-300 hover:bg-slate-800 hover:text-amber-200'
                  : 'bg-white border-slate-200 text-amber-600 hover:bg-slate-100 shadow-xs'
              }`}
            >
              {isDark ? (
                <Sun className="w-4 h-4 transition-transform hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 transition-transform hover:-rotate-12" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex flex-col justify-center py-4">
        {activeTab === 'app' ? (
          <>
            {isSetupOpen ? (
              config === null ? (
                <AlarmSetupFlow
                  currentConfig={config}
                  onSave={handleSaveConfig}
                  onCancel={() => setIsSetupOpen(false)}
                />
              ) : (
                <AlarmEditScreen
                  currentConfig={config}
                  onSave={handleSaveConfig}
                  onCancel={() => setIsSetupOpen(false)}
                />
              )
            ) : (
              <MainScreen
                config={config}
                onOpenSetup={() => setIsSetupOpen(true)}
                onToggleAlarm={handleToggleAlarm}
                onTriggerAlarmTest={() => setIsRinging(true)}
              />
            )}
          </>
        ) : (
          <FlutterTechSpec />
        )}
      </div>

      {/* Bottom Testing Bar for Quick State Inspection */}
      <footer
        className={`border-t py-3 px-4 text-center text-xs transition-colors ${
          isDark
            ? 'border-slate-900 bg-slate-950/60 text-slate-500'
            : 'border-slate-200 bg-slate-100/70 text-slate-500'
        }`}
      >
        <div className="max-w-md mx-auto flex items-center justify-center gap-4">
          {config ? (
            <button
              onClick={handleResetToEmpty}
              className={`transition-colors cursor-pointer ${
                isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              تجربة حالة: المنبه غير مضبوط بعد
            </button>
          ) : (
            <button
              onClick={handleRestoreDefaults}
              className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium transition-colors cursor-pointer"
            >
              استعادة الإعدادات النموذجية
            </button>
          )}
        </div>
      </footer>

      {/* Ringing Screen Overlay */}
      {isRinging && config && (
        <RingingScreen
          config={config}
          onDismiss={() => setIsRinging(false)}
        />
      )}
    </div>
  );
}
