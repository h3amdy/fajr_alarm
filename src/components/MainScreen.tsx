import React, { useState, useEffect } from 'react';
import { AlarmConfig, formatArabicTime, formatOffsetLabel, formatTodayArabic, ALARM_TONES } from '../utils/fajrLogic';
import { soundService } from '../utils/soundService';
import { useTheme } from '../themeContext';
import { Moon, Bell, BellOff, Edit3, BookOpen, HelpCircle, Calculator, Play, Square, Volume2 } from 'lucide-react';

interface MainScreenProps {
  config: AlarmConfig | null;
  onOpenSetup: () => void;
  onToggleAlarm: () => void;
  onTriggerAlarmTest: () => void;
}

export const MainScreen: React.FC<MainScreenProps> = ({
  config,
  onOpenSetup,
  onToggleAlarm,
  onTriggerAlarmTest,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const todayArabic = formatTodayArabic();

  const [isPlayingTonePreview, setIsPlayingTonePreview] = useState(false);

  useEffect(() => {
    const unsubscribe = soundService.subscribePlayback((isPlaying, toneId) => {
      setIsPlayingTonePreview(isPlaying && toneId === config?.selectedToneId);
    });
    return () => {
      unsubscribe();
      soundService.stopAlarmSound();
    };
  }, [config?.selectedToneId]);

  const activeTone =
    ALARM_TONES.find((t) => t.id === config?.selectedToneId) || ALARM_TONES[0];

  const handleTogglePreviewTone = () => {
    if (!config) return;
    if (isPlayingTonePreview) {
      soundService.stopAlarmSound();
    } else {
      soundService.previewTone(config.selectedToneId);
    }
  };

  // If alarm is not configured yet
  if (!config) {
    return (
      <main className="flex flex-col items-center justify-center min-h-[620px] px-6 text-center select-none">
        <div className="relative mb-8">
          <div
            className={`w-28 h-28 rounded-full border flex items-center justify-center shadow-lg transition-colors ${
              isDark
                ? 'bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/5'
                : 'bg-emerald-50 border-emerald-200 shadow-emerald-100'
            }`}
          >
            <span className="text-5xl" role="img" aria-label="شمس الفجر">🌅</span>
          </div>
          <div
            className={`absolute -top-1 -right-1 w-8 h-8 rounded-full border flex items-center justify-center ${
              isDark
                ? 'bg-slate-900 border-emerald-500/30 text-emerald-400'
                : 'bg-white border-emerald-200 text-emerald-600 shadow-xs'
            }`}
          >
            <Moon className="w-4 h-4" />
          </div>
        </div>

        <h1
          className={`text-3xl sm:text-4xl font-bold tracking-tight mb-3 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}
        >
          ابدأ بمنبه الفجر
        </h1>

        <p
          className={`max-w-sm text-base sm:text-lg mb-8 leading-relaxed ${
            isDark ? 'text-slate-400' : 'text-slate-600'
          }`}
        >
          استيقظ لصلاة الفجر وابدأ يومك بذكر الله وتجربة استيقاظ هادئة وحازمة.
        </p>

        <button
          onClick={onOpenSetup}
          className="w-full max-w-xs py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-lg shadow-xl shadow-emerald-900/30 transition-all duration-200 active:scale-[0.98] cursor-pointer"
        >
          ضبط منبه الفجر
        </button>
      </main>
    );
  }

  const getMissionIcon = () => {
    switch (config.missionType) {
      case 'dhikr':
        return <BookOpen className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />;
      case 'tasbih':
        return <span className="text-base">📿</span>;
      case 'religious_quiz':
        return <HelpCircle className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />;
      case 'math_quiz':
        return <Calculator className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />;
      case 'barcode':
        return <span className="text-base">🪥</span>;
    }
  };

  const getMissionTitle = () => {
    switch (config.missionType) {
      case 'dhikr':
        return 'أذكار الاستيقاظ';
      case 'tasbih':
        return `التسبيح (${config.tasbihCount} مرات)`;
      case 'religious_quiz':
        return `أسئلة دينية (${config.religiousQuestionsCount} ${
          config.religiousQuestionsCount === 1 ? 'سؤال' : 'أسئلة'
        })`;
      case 'math_quiz':
        return `مسائل حسابية (${config.mathQuestionsCount} ${
          config.mathQuestionsCount === 1 ? 'مسألة' : 'مسائل'
        })`;
      case 'barcode':
        return 'مغادرة الفراش (مسح الباركود)';
    }
  };

  const getMissionSubtext = () => {
    switch (config.missionType) {
      case 'dhikr':
        return 'قراءة أذكار الصباح المأثورة';
      case 'tasbih':
        return config.tasbihPhrase || 'سبحان الله';
      case 'religious_quiz':
        return 'من بنك يضم أكثر من 25 سؤالاً إسلامياً';
      case 'math_quiz':
        return config.mathDifficulty === 'easy' ? 'مستوى سهل' : config.mathDifficulty === 'hard' ? 'مستوى متقدم' : 'مستوى متوسط';
      case 'barcode':
        return config.barcodeLabel || 'معجون الأسنان بالحمام 🪥';
    }
  };

  return (
    <main className="flex flex-col items-center justify-center max-w-md mx-auto w-full px-5 py-6 select-none">
      {/* Crescent Icon & App Title */}
      <div className="flex flex-col items-center mb-6">
        <div
          className={`w-16 h-16 rounded-3xl border flex items-center justify-center shadow-inner mb-3 transition-colors ${
            isDark
              ? 'bg-slate-900/80 border-slate-800/80 text-emerald-300'
              : 'bg-white border-slate-200 text-emerald-600 shadow-sm'
          }`}
        >
          <Moon className={`w-8 h-8 ${isDark ? 'fill-emerald-400/20' : 'fill-emerald-100'} stroke-[1.5]`} />
        </div>
        <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          منبه الفجر
        </h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {todayArabic}
        </p>
      </div>

      {/* Fajr Prayer Time display */}
      <div className="text-center mb-6">
        <span
          className={`text-xs uppercase tracking-widest font-semibold px-2.5 py-0.5 rounded-full border transition-colors ${
            isDark
              ? 'bg-emerald-950/50 border-emerald-800/40 text-emerald-400'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          صلاة الفجر
        </span>
        <div
          className={`text-4xl sm:text-5xl font-extrabold mt-2 tracking-tight ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}
        >
          {formatArabicTime(config.fajrTime)}
        </div>
        <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
          بحسب توقيت {config.city}
        </p>
      </div>

      {/* Wake Up Time Card */}
      <div
        className={`w-full border rounded-3xl p-5 mb-5 shadow-xl relative overflow-hidden backdrop-blur-sm transition-colors ${
          isDark
            ? 'bg-slate-900/90 border-slate-800'
            : 'bg-white border-slate-200/90 shadow-slate-200/50'
        }`}
      >
        <div
          className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl pointer-events-none ${
            isDark ? 'bg-emerald-500/5' : 'bg-emerald-500/10'
          }`}
        />

        <div className="flex items-center justify-between">
          <div>
            <div className={`text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              الاستيقاظ
            </div>
            <div
              className={`text-3xl font-extrabold ${
                isDark ? 'text-emerald-300' : 'text-emerald-700'
              }`}
            >
              {formatArabicTime(config.wakeUpTime)}
            </div>
            <div
              className={`text-xs font-medium mt-1 ${
                isDark ? 'text-emerald-400/80' : 'text-emerald-600'
              }`}
            >
              {formatOffsetLabel(config.offsetMinutes)}
            </div>
          </div>

          <button
            onClick={onToggleAlarm}
            aria-label={config.isEnabled ? 'تعطيل المنبه' : 'تفعيل المنبه'}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 cursor-pointer ${
              config.isEnabled
                ? isDark
                  ? 'bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 shadow-md shadow-emerald-950'
                  : 'bg-emerald-50 border border-emerald-300 text-emerald-700 shadow-sm'
                : isDark
                ? 'bg-slate-800/80 border border-slate-700/60 text-slate-500'
                : 'bg-slate-100 border border-slate-200 text-slate-400'
            }`}
          >
            {config.isEnabled ? <Bell className="w-6 h-6 animate-pulse" /> : <BellOff className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Wake-Up Mission Info Card */}
      <div
        className={`w-full border rounded-2xl p-4 mb-6 flex items-center justify-between transition-colors ${
          isDark
            ? 'bg-slate-900/60 border-slate-800/80'
            : 'bg-white border-slate-200/90 shadow-xs'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
              isDark
                ? 'bg-slate-800/80 border-slate-700/60'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            {getMissionIcon()}
          </div>
          <div>
            <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>مهمة الاستيقاظ</div>
            <div className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {getMissionTitle()}
            </div>
            <div className={`text-[11px] ${isDark ? 'text-emerald-400/90' : 'text-emerald-700'}`}>
              {getMissionSubtext()}
            </div>
          </div>
        </div>

        <button
          onClick={onOpenSetup}
          className={`text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg border cursor-pointer transition-colors ${
            isDark
              ? 'text-emerald-400 bg-emerald-950/40 border-emerald-900/50 hover:text-emerald-300'
              : 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          تعديل
        </button>
      </div>

      {/* Alarm Sound Tone Card */}
      <div
        className={`w-full border rounded-2xl p-3.5 mb-5 flex items-center justify-between transition-colors ${
          isDark
            ? 'bg-slate-900/60 border-slate-800/80'
            : 'bg-white border-slate-200/90 shadow-xs'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl border flex items-center justify-center text-lg ${
              isDark
                ? 'bg-slate-800/80 border-slate-700/60'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            {activeTone.icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>نغمة المنبه</div>
            <div className={`text-sm font-semibold truncate max-w-[130px] sm:max-w-[220px] ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {activeTone.title}
            </div>
            <div className={`text-[11px] font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
              {activeTone.durationLabel}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleTogglePreviewTone}
            className={`text-xs flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border cursor-pointer transition-colors ${
              isPlayingTonePreview
                ? 'bg-emerald-500 text-white animate-pulse'
                : isDark
                ? 'text-slate-300 bg-slate-800/80 border-slate-700 hover:text-white'
                : 'text-slate-700 bg-slate-100 border-slate-200 hover:bg-slate-200'
            }`}
          >
            {isPlayingTonePreview ? (
              <>
                <Square className="w-3 h-3 fill-current" />
                <span>إيقاف</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current ml-0.5" />
                <span>استماع</span>
              </>
            )}
          </button>

          <button
            onClick={onOpenSetup}
            className={`text-xs flex items-center gap-1 px-2.5 py-1.5 rounded-lg border cursor-pointer transition-colors ${
              isDark
                ? 'text-emerald-400 bg-emerald-950/40 border-emerald-900/50 hover:text-emerald-300'
                : 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
            }`}
            title="تغيير نغمة المنبه"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>تغيير</span>
          </button>
        </div>
      </div>

      {/* Alarm Status Indicator */}
      <div className="flex items-center gap-2 mb-6">
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            config.isEnabled
              ? isDark
                ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
              : isDark
              ? 'bg-slate-600'
              : 'bg-slate-400'
          }`}
        />
        <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          {config.isEnabled ? 'المنبه مفعل ومضبوط' : 'المنبه معطل حالياً'}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="w-full flex flex-col gap-3">
        <button
          onClick={onOpenSetup}
          className={`w-full py-3.5 px-4 rounded-2xl border font-semibold text-base transition-colors flex items-center justify-center gap-2 cursor-pointer ${
            isDark
              ? 'bg-slate-900 hover:bg-slate-800/90 border-slate-700/80 text-white'
              : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800 shadow-xs'
          }`}
        >
          <Edit3 className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
          تعديل المنبه والمهمة
        </button>

        {/* Live Experience Trigger */}
        <button
          onClick={onTriggerAlarmTest}
          className={`w-full py-3 px-4 rounded-2xl border font-medium text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
            isDark
              ? 'bg-emerald-950/60 hover:bg-emerald-900/50 border-emerald-700/40 text-emerald-300'
              : 'bg-emerald-50 hover:bg-emerald-100/90 border-emerald-300 text-emerald-800'
          }`}
        >
          <Play className="w-4 h-4 fill-emerald-500 text-emerald-500" />
          تجربة شاشة الرنين والمهمة الآن (مع الصوت)
        </button>
      </div>
    </main>
  );
};
