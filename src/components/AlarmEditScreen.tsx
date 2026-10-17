import React, { useState } from 'react';
import {
  AlarmConfig,
  MissionType,
  MathDifficulty,
  AlarmToneId,
  calculateWakeUpTime,
  formatArabicTime,
  formatOffsetLabel,
  TASBIH_PHRASES,
  RELIGIOUS_QUESTIONS,
  BARCODE_PRESETS,
} from '../utils/fajrLogic';
import { useTheme } from '../themeContext';
import { ToneSelector } from './ToneSelector';
import { BarcodeSetupConfigurator } from './BarcodeSetupConfigurator';
import { Check, X, Clock, Sparkles, Volume2 } from 'lucide-react';

interface AlarmEditScreenProps {
  currentConfig: AlarmConfig;
  onSave: (config: AlarmConfig) => void;
  onCancel: () => void;
}

const OFFSET_OPTIONS = [
  { value: 0, label: 'عند الفجر' },
  { value: -5, label: 'قبل 5 دقائق' },
  { value: -10, label: 'قبل 10 دقائق' },
  { value: -15, label: 'قبل 15 دقيقة' },
  { value: -30, label: 'قبل 30 دقيقة' },
];

const TASBIH_PRESETS = [3, 5, 8, 10, 33, 100];
const QUESTIONS_COUNT_PRESETS = [1, 2, 3, 5];

export const AlarmEditScreen: React.FC<AlarmEditScreenProps> = ({
  currentConfig,
  onSave,
  onCancel,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [fajrTime] = useState<string>(currentConfig.fajrTime || '04:52');
  const [offsetMinutes, setOffsetMinutes] = useState<number>(currentConfig.offsetMinutes ?? -15);
  const [missionType, setMissionType] = useState<MissionType>(currentConfig.missionType || 'tasbih');

  // Tasbih state
  const [tasbihCount, setTasbihCount] = useState<number>(currentConfig.tasbihCount || 5);
  const [isCustomTasbih, setIsCustomTasbih] = useState<boolean>(
    !TASBIH_PRESETS.includes(currentConfig.tasbihCount)
  );
  const [customTasbihInput, setCustomTasbihInput] = useState<string>(
    !TASBIH_PRESETS.includes(currentConfig.tasbihCount)
      ? String(currentConfig.tasbihCount)
      : '7'
  );
  const [tasbihPhrase, setTasbihPhrase] = useState<string>(
    currentConfig.tasbihPhrase || TASBIH_PHRASES[0]
  );

  // Religious questions count
  const [religiousQuestionsCount, setReligiousQuestionsCount] = useState<number>(
    currentConfig.religiousQuestionsCount || 2
  );
  const [isCustomReligiousCount, setIsCustomReligiousCount] = useState<boolean>(false);
  const [customReligiousInput, setCustomReligiousInput] = useState<string>('4');

  // Math state
  const [mathQuestionsCount, setMathQuestionsCount] = useState<number>(
    currentConfig.mathQuestionsCount || 2
  );
  const [isCustomMathCount, setIsCustomMathCount] = useState<boolean>(false);
  const [customMathInput, setCustomMathInput] = useState<string>('4');
  const [mathDifficulty, setMathDifficulty] = useState<MathDifficulty>(
    currentConfig.mathDifficulty || 'medium'
  );

  const [city] = useState<string>(currentConfig.city || 'مكة المكرمة');
  const [selectedToneId, setSelectedToneId] = useState<AlarmToneId>(
    currentConfig.selectedToneId || 'tone_qom'
  );
  const [barcodeValue, setBarcodeValue] = useState<string>(
    currentConfig.barcodeValue || BARCODE_PRESETS[0].code
  );
  const [barcodeLabel, setBarcodeLabel] = useState<string>(
    currentConfig.barcodeLabel || BARCODE_PRESETS[0].label
  );

  const computedWakeUpTime = calculateWakeUpTime(fajrTime, offsetMinutes);

  const handleSave = () => {
    const finalTasbihCount = isCustomTasbih
      ? Math.max(1, parseInt(customTasbihInput, 10) || 5)
      : tasbihCount;

    const finalReligiousCount = isCustomReligiousCount
      ? Math.max(1, Math.min(20, parseInt(customReligiousInput, 10) || 2))
      : religiousQuestionsCount;

    const finalMathCount = isCustomMathCount
      ? Math.max(1, Math.min(20, parseInt(customMathInput, 10) || 2))
      : mathQuestionsCount;

    const newConfig: AlarmConfig = {
      ...currentConfig,
      fajrTime,
      offsetMinutes,
      wakeUpTime: computedWakeUpTime,
      missionType,
      tasbihCount: finalTasbihCount,
      tasbihPhrase,
      religiousQuestionsCount: finalReligiousCount,
      mathQuestionsCount: finalMathCount,
      mathDifficulty,
      selectedToneId,
      city,
      barcodeValue,
      barcodeLabel,
    };

    onSave(newConfig);
  };

  return (
    <div className="max-w-md mx-auto w-full px-5 py-4 pb-12 select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={onCancel}
          className={`p-2 -mr-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1 text-sm font-medium ${
            isDark
              ? 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <X className="w-5 h-5" />
          <span>إلغاء</span>
        </button>

        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
          تعديل المنبه والمهمة
        </h2>

        <div className="w-10" />
      </div>

      {/* SECTION 1: وقت الاستيقاظ والفارق */}
      <div
        className={`border rounded-3xl p-5 mb-5 shadow-lg transition-colors ${
          isDark
            ? 'bg-slate-900/80 border-slate-800'
            : 'bg-white border-slate-200/90 shadow-slate-200/50'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              توقيت الاستيقاظ
            </h3>
          </div>
          <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            الفجر:{' '}
            <strong className={`font-mono ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
              {formatArabicTime(fajrTime)}
            </strong>
          </span>
        </div>

        {/* Offset chips */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
          {OFFSET_OPTIONS.map((opt) => {
            const isSelected = offsetMinutes === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setOffsetMinutes(opt.value)}
                className={`py-2.5 px-3 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? isDark
                      ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-sm'
                      : 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-xs'
                    : isDark
                    ? 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Dynamic Computed Time */}
        <div
          className={`py-2.5 px-4 rounded-xl border flex items-center justify-between transition-colors ${
            isDark
              ? 'bg-slate-950/90 border-slate-800/80'
              : 'bg-slate-50 border-slate-200'
          }`}
        >
          <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>الرنين المحدد:</span>
          <span
            className={`text-base font-bold ${
              isDark ? 'text-emerald-300' : 'text-emerald-700'
            }`}
          >
            {formatArabicTime(computedWakeUpTime)} ({formatOffsetLabel(offsetMinutes)})
          </span>
        </div>
      </div>

      {/* SECTION 2: مهمة الاستيقاظ في نفس الواجهة */}
      <div
        className={`border rounded-3xl p-5 mb-6 shadow-lg transition-colors ${
          isDark
            ? 'bg-slate-900/80 border-slate-800'
            : 'bg-white border-slate-200/90 shadow-slate-200/50'
        }`}
      >
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
          <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            مهمة إيقاف المنبه
          </h3>
        </div>

        {/* Mission Type Selection */}
        <div className="flex flex-col gap-2.5 mb-4">
          {/* 1. أذكار الاستيقاظ */}
          <div
            onClick={() => setMissionType('dhikr')}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
              missionType === 'dhikr'
                ? isDark
                  ? 'bg-emerald-950/40 border-emerald-500 text-white'
                  : 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-xs'
                : isDark
                ? 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-lg">🕌</span>
                <div>
                  <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    أذكار الاستيقاظ
                  </div>
                  <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    قراءة الذكر المأثور وتأكيد الإتمام
                  </div>
                </div>
              </div>
              {missionType === 'dhikr' && <Check className="w-4 h-4 text-emerald-500 stroke-[3]" />}
            </div>
          </div>

          {/* 2. التسبيح */}
          <div
            onClick={() => setMissionType('tasbih')}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
              missionType === 'tasbih'
                ? isDark
                  ? 'bg-emerald-950/40 border-emerald-500 text-white'
                  : 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-xs'
                : isDark
                ? 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2.5">
                <span className="text-lg">📿</span>
                <div>
                  <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    التسبيح
                  </div>
                  <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    اختر عدد التسبيحات والصيغة
                  </div>
                </div>
              </div>
              {missionType === 'tasbih' && <Check className="w-4 h-4 text-emerald-500 stroke-[3]" />}
            </div>

            {missionType === 'tasbih' && (
              <div
                className={`mt-3 pt-3 border-t space-y-2.5 ${
                  isDark ? 'border-slate-800/80' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5 flex-wrap">
                  {TASBIH_PRESETS.map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsCustomTasbih(false);
                        setTasbihCount(cnt);
                      }}
                      className={`py-1 px-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        !isCustomTasbih && tasbihCount === cnt
                          ? 'bg-emerald-500 text-white'
                          : isDark
                          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {cnt}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsCustomTasbih(true);
                    }}
                    className={`py-1 px-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      isCustomTasbih
                        ? 'bg-emerald-500 text-white'
                        : isDark
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    مخصص
                  </button>
                </div>

                {isCustomTasbih && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>حدد العدد:</span>
                    <input
                      type="number"
                      min="1"
                      max="999"
                      value={customTasbihInput}
                      onChange={(e) => setCustomTasbihInput(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className={`w-20 py-1 px-2 rounded-lg border font-bold text-center text-xs focus:outline-none ${
                        isDark
                          ? 'bg-slate-900 border-emerald-500/60 text-white'
                          : 'bg-white border-emerald-500 text-slate-900 shadow-xs'
                      }`}
                    />
                    <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>تسبيحة</span>
                  </div>
                )}

                <div className="pt-1">
                  <select
                    value={tasbihPhrase}
                    onChange={(e) => setTasbihPhrase(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className={`w-full py-1.5 px-2.5 rounded-lg border text-xs focus:outline-none focus:border-emerald-500 ${
                      isDark
                        ? 'bg-slate-900 border-slate-700 text-white'
                        : 'bg-white border-slate-300 text-slate-900 shadow-xs'
                    }`}
                  >
                    {TASBIH_PHRASES.map((phrase, i) => (
                      <option key={i} value={phrase}>
                        {phrase}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* 3. سؤال ديني */}
          <div
            onClick={() => setMissionType('religious_quiz')}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
              missionType === 'religious_quiz'
                ? isDark
                  ? 'bg-emerald-950/40 border-emerald-500 text-white'
                  : 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-xs'
                : isDark
                ? 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2.5">
                <span className="text-lg">🧠</span>
                <div>
                  <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    سؤال ديني
                  </div>
                  <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    من بنك يضم {RELIGIOUS_QUESTIONS.length} سؤالاً إسلامياً
                  </div>
                </div>
              </div>
              {missionType === 'religious_quiz' && <Check className="w-4 h-4 text-emerald-500 stroke-[3]" />}
            </div>

            {missionType === 'religious_quiz' && (
              <div
                className={`mt-3 pt-3 border-t space-y-2 ${
                  isDark ? 'border-slate-800/80' : 'border-slate-200'
                }`}
              >
                <span className={`text-xs block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  عدد الأسئلة:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {QUESTIONS_COUNT_PRESETS.map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsCustomReligiousCount(false);
                        setReligiousQuestionsCount(cnt);
                      }}
                      className={`py-1 px-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        !isCustomReligiousCount && religiousQuestionsCount === cnt
                          ? 'bg-emerald-500 text-white'
                          : isDark
                          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {cnt === 1 ? 'سؤال' : cnt === 2 ? 'سؤالين' : `${cnt} أسئلة`}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsCustomReligiousCount(true);
                    }}
                    className={`py-1 px-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      isCustomReligiousCount
                        ? 'bg-emerald-500 text-white'
                        : isDark
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    مخصص
                  </button>
                </div>

                {isCustomReligiousCount && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      حدد عدد الأسئلة:
                    </span>
                    <input
                      type="number"
                      min="1"
                      max="15"
                      value={customReligiousInput}
                      onChange={(e) => setCustomReligiousInput(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className={`w-16 py-1 px-2 rounded-lg border font-bold text-center text-xs focus:outline-none ${
                        isDark
                          ? 'bg-slate-900 border-emerald-500/60 text-white'
                          : 'bg-white border-emerald-500 text-slate-900 shadow-xs'
                      }`}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 4. سؤال رياضي */}
          <div
            onClick={() => setMissionType('math_quiz')}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
              missionType === 'math_quiz'
                ? isDark
                  ? 'bg-emerald-950/40 border-emerald-500 text-white'
                  : 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-xs'
                : isDark
                ? 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2.5">
                <span className="text-lg">🔢</span>
                <div>
                  <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    سؤال رياضي
                  </div>
                  <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    حل مسائل حسابية لإيقاظ العقل
                  </div>
                </div>
              </div>
              {missionType === 'math_quiz' && <Check className="w-4 h-4 text-emerald-500 stroke-[3]" />}
            </div>

            {missionType === 'math_quiz' && (
              <div
                className={`mt-3 pt-3 border-t space-y-2.5 ${
                  isDark ? 'border-slate-800/80' : 'border-slate-200'
                }`}
              >
                <div>
                  <span className={`text-xs block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    عدد المسائل:
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {QUESTIONS_COUNT_PRESETS.map((cnt) => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsCustomMathCount(false);
                          setMathQuestionsCount(cnt);
                        }}
                        className={`py-1 px-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          !isCustomMathCount && mathQuestionsCount === cnt
                            ? 'bg-emerald-500 text-white'
                            : isDark
                            ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {cnt === 1 ? 'مسألة' : cnt === 2 ? 'مسألتين' : `${cnt} مسائل`}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsCustomMathCount(true);
                      }}
                      className={`py-1 px-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        isCustomMathCount
                          ? 'bg-emerald-500 text-white'
                          : isDark
                          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      مخصص
                    </button>
                  </div>
                </div>

                <div>
                  <span className={`text-xs block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    المستوى:
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { key: 'easy', label: 'سهل' },
                      { key: 'medium', label: 'متوسط' },
                      { key: 'hard', label: 'متقدم' },
                    ].map((diff) => (
                      <button
                        key={diff.key}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMathDifficulty(diff.key as MathDifficulty);
                        }}
                        className={`py-1 px-2 rounded-lg text-xs font-bold transition-colors cursor-pointer text-center ${
                          mathDifficulty === diff.key
                            ? 'bg-emerald-500 text-white'
                            : isDark
                            ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {diff.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 5. مهمة مغادرة الفراش (مسح الباركود / مكان الوضوء) */}
          <div
            onClick={() => setMissionType('barcode')}
            className={`border rounded-2xl p-4 cursor-pointer transition-all ${
              missionType === 'barcode'
                ? isDark
                  ? 'bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-950/50'
                  : 'bg-emerald-50 border-emerald-500 shadow-xs'
                : isDark
                ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                    isDark ? 'bg-slate-800' : 'bg-slate-100'
                  }`}
                >
                  🪥
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      مغادرة الفراش (مسح الباركود)
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      ضمان اليقظة 100%
                    </span>
                  </div>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    يُلزمك بالقيام ومسح باركود معجون الأسنان أو مصحف الصالة لإيقاف الرنين
                  </p>
                </div>
              </div>
              {missionType === 'barcode' && <Check className="w-4 h-4 text-emerald-500 stroke-[3]" />}
            </div>

            {/* Sub-selector for Barcode Target Location & Registration */}
            {missionType === 'barcode' && (
              <BarcodeSetupConfigurator
                barcodeValue={barcodeValue}
                barcodeLabel={barcodeLabel}
                onChangeBarcode={(newCode, newLabel) => {
                  setBarcodeValue(newCode);
                  setBarcodeLabel(newLabel);
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* SECTION 3: نغمة صوت المنبه */}
      <div
        className={`border rounded-3xl p-5 mb-6 shadow-lg transition-colors ${
          isDark
            ? 'bg-slate-900/80 border-slate-800'
            : 'bg-white border-slate-200/90 shadow-slate-200/50'
        }`}
      >
        <div className="flex items-center gap-2 mb-3">
          <Volume2 className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
          <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            صوت ونغمة الاستيقاظ
          </h3>
        </div>

        <ToneSelector
          selectedToneId={selectedToneId}
          onSelectTone={setSelectedToneId}
        />
      </div>

      {/* Save Changes Button */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-base shadow-xl shadow-emerald-900/30 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5 stroke-[2.5]" />
          <span>حفظ التعديلات</span>
        </button>

        <button
          onClick={onCancel}
          className={`py-4 px-5 rounded-2xl border font-medium text-sm transition-colors cursor-pointer ${
            isDark
              ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
              : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700 shadow-xs'
          }`}
        >
          إلغاء
        </button>
      </div>
    </div>
  );
};
