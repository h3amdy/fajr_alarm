import React, { useState } from 'react';
import {
  AlarmConfig,
  MissionType,
  MathDifficulty,
  AlarmToneId,
  calculateWakeUpTime,
  formatArabicTime,
  TASBIH_PHRASES,
  RELIGIOUS_QUESTIONS,
} from '../utils/fajrLogic';
import { useTheme } from '../themeContext';
import { ToneSelector } from './ToneSelector';
import { Check, ChevronRight, ArrowLeft } from 'lucide-react';

interface AlarmSetupFlowProps {
  currentConfig: AlarmConfig | null;
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

export const AlarmSetupFlow: React.FC<AlarmSetupFlowProps> = ({
  currentConfig,
  onSave,
  onCancel,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [step, setStep] = useState<1 | 2>(1);
  const [fajrTime] = useState<string>(currentConfig?.fajrTime || '04:52');
  const [offsetMinutes, setOffsetMinutes] = useState<number>(currentConfig?.offsetMinutes ?? -15);
  const [missionType, setMissionType] = useState<MissionType>(currentConfig?.missionType || 'tasbih');

  // Tasbih state
  const [tasbihCount, setTasbihCount] = useState<number>(currentConfig?.tasbihCount || 5);
  const [isCustomTasbih, setIsCustomTasbih] = useState<boolean>(
    currentConfig ? !TASBIH_PRESETS.includes(currentConfig.tasbihCount) : false
  );
  const [customTasbihInput, setCustomTasbihInput] = useState<string>(
    currentConfig && !TASBIH_PRESETS.includes(currentConfig.tasbihCount)
      ? String(currentConfig.tasbihCount)
      : '7'
  );
  const [tasbihPhrase, setTasbihPhrase] = useState<string>(
    currentConfig?.tasbihPhrase || TASBIH_PHRASES[0]
  );

  // Religious questions count
  const [religiousQuestionsCount, setReligiousQuestionsCount] = useState<number>(
    currentConfig?.religiousQuestionsCount || 1
  );
  const [isCustomReligiousCount, setIsCustomReligiousCount] = useState<boolean>(false);
  const [customReligiousInput, setCustomReligiousInput] = useState<string>('4');

  // Math state
  const [mathQuestionsCount, setMathQuestionsCount] = useState<number>(
    currentConfig?.mathQuestionsCount || 2
  );
  const [isCustomMathCount, setIsCustomMathCount] = useState<boolean>(false);
  const [customMathInput, setCustomMathInput] = useState<string>('4');
  const [mathDifficulty, setMathDifficulty] = useState<MathDifficulty>(
    currentConfig?.mathDifficulty || 'medium'
  );

  const [city] = useState<string>(currentConfig?.city || 'مكة المكرمة');
  const [selectedToneId, setSelectedToneId] = useState<AlarmToneId>(
    currentConfig?.selectedToneId || 'tone_qom'
  );

  const computedWakeUpTime = calculateWakeUpTime(fajrTime, offsetMinutes);

  const handleNext = () => {
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleFinish = () => {
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
      isEnabled: true,
      city,
    };
    onSave(newConfig);
  };

  return (
    <div className="max-w-md mx-auto w-full px-5 py-6 select-none">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={step === 2 ? handleBack : onCancel}
          className={`p-2 -mr-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1 text-sm font-medium ${
            isDark
              ? 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ChevronRight className="w-5 h-5" />
          <span>{step === 2 ? 'رجوع' : 'إلغاء'}</span>
        </button>

        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full border ${
            isDark
              ? 'text-slate-400 bg-slate-900 border-slate-800'
              : 'text-slate-600 bg-white border-slate-200'
          }`}
        >
          خطوة {step} من 2
        </span>
      </div>

      {step === 1 ? (
        /* STEP 1: متى تريد الاستيقاظ؟ */
        <div className="flex flex-col">
          <div className="text-center mb-6">
            <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              منبه الفجر
            </h2>
            <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              الفجر اليوم:{' '}
              <span className={`font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                {formatArabicTime(fajrTime)}
              </span>
            </div>
          </div>

          <h3 className={`text-base font-semibold mb-3 text-right ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            متى تريد الاستيقاظ؟
          </h3>

          {/* Cards for time selection */}
          <div className="flex flex-col gap-2.5 mb-6">
            {OFFSET_OPTIONS.map((opt) => {
              const isSelected = offsetMinutes === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setOffsetMinutes(opt.value)}
                  className={`w-full py-4 px-5 rounded-2xl border text-right font-medium transition-all duration-150 flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? isDark
                        ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-lg shadow-emerald-950/50'
                        : 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm'
                      : isDark
                      ? 'bg-slate-900/70 border-slate-800 hover:border-slate-700 text-slate-300'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 shadow-xs'
                  }`}
                >
                  <span className="text-base font-semibold">{opt.label}</span>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Dynamic computed wake up preview */}
          <div
            className={`border rounded-2xl p-4 text-center mb-6 transition-colors ${
              isDark
                ? 'bg-slate-900/90 border-slate-800'
                : 'bg-white border-slate-200/90 shadow-xs'
            }`}
          >
            <span className={`text-xs block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              وقت الاستيقاظ المحدد:
            </span>
            <span
              className={`text-lg font-bold ${
                isDark ? 'text-emerald-300' : 'text-emerald-700'
              }`}
            >
              سيوقظك التطبيق الساعة {formatArabicTime(computedWakeUpTime)}
            </span>
          </div>

          <button
            onClick={handleNext}
            className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base shadow-xl shadow-emerald-950/30 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>التالي</span>
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      ) : (
        /* STEP 2: اختيار مهمة الاستيقاظ */
        <div className="flex flex-col">
          <div className="text-center mb-5">
            <h2 className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              كيف تريد أن تستيقظ؟
            </h2>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              اختر مهمة واحدة لإيقاف المنبه وحدد عددها.
            </p>
          </div>

          <div className="flex flex-col gap-3 mb-6">
            {/* 1. أذكار الاستيقاظ */}
            <div
              onClick={() => setMissionType('dhikr')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                missionType === 'dhikr'
                  ? isDark
                    ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-md shadow-emerald-950'
                    : 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-sm'
                  : isDark
                  ? 'bg-slate-900/70 border-slate-800 hover:border-slate-700 text-slate-300'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                      isDark ? 'bg-slate-800/80' : 'bg-slate-100'
                    }`}
                  >
                    🕌
                  </div>
                  <div>
                    <div className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      أذكار الاستيقاظ
                    </div>
                    <div className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      اقرأ الذكر ثم أكد إتمامه
                    </div>
                  </div>
                </div>
                {missionType === 'dhikr' && (
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center mt-1">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}
              </div>
            </div>

            {/* 2. التسبيح */}
            <div
              onClick={() => setMissionType('tasbih')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                missionType === 'tasbih'
                  ? isDark
                    ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-md shadow-emerald-950'
                    : 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-sm'
                  : isDark
                  ? 'bg-slate-900/70 border-slate-800 hover:border-slate-700 text-slate-300'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                      isDark ? 'bg-slate-800/80' : 'bg-slate-100'
                    }`}
                  >
                    📿
                  </div>
                  <div>
                    <div className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      التسبيح
                    </div>
                    <div className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      اختر عدد التسبيحات (3، 5، 8 أو عدد مخصص)
                    </div>
                  </div>
                </div>
                {missionType === 'tasbih' && (
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center mt-1">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}
              </div>

              {/* Sub-selector for Tasbih count & phrase */}
              {missionType === 'tasbih' && (
                <div
                  className={`mt-4 pt-3 border-t space-y-3 ${
                    isDark ? 'border-slate-800/80' : 'border-slate-200'
                  }`}
                >
                  <div>
                    <span className={`text-xs block mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      عدد التسبيحات:
                    </span>
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                      {TASBIH_PRESETS.map((cnt) => (
                        <button
                          key={cnt}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsCustomTasbih(false);
                            setTasbihCount(cnt);
                          }}
                          className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            !isCustomTasbih && tasbihCount === cnt
                              ? 'bg-emerald-500 text-white'
                              : isDark
                              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          isCustomTasbih
                            ? 'bg-emerald-500 text-white'
                            : isDark
                            ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        مخصص
                      </button>
                    </div>

                    {isCustomTasbih && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          حدد العدد:
                        </span>
                        <input
                          type="number"
                          min="1"
                          max="999"
                          value={customTasbihInput}
                          onChange={(e) => setCustomTasbihInput(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className={`w-24 py-1 px-3 rounded-lg border font-bold text-center text-sm focus:outline-none ${
                            isDark
                              ? 'bg-slate-950 border-emerald-500/60 text-white'
                              : 'bg-white border-emerald-500 text-slate-900 shadow-xs'
                          }`}
                        />
                        <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          تسبيحة
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Choose Dhikr Phrase */}
                  <div>
                    <span className={`text-xs block mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      صيغة الذكر:
                    </span>
                    <select
                      value={tasbihPhrase}
                      onChange={(e) => setTasbihPhrase(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className={`w-full py-2 px-3 rounded-xl border text-xs focus:outline-none focus:border-emerald-500 ${
                        isDark
                          ? 'bg-slate-950 border-slate-700 text-white'
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
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                missionType === 'religious_quiz'
                  ? isDark
                    ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-md shadow-emerald-950'
                    : 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-sm'
                  : isDark
                  ? 'bg-slate-900/70 border-slate-800 hover:border-slate-700 text-slate-300'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                      isDark ? 'bg-slate-800/80' : 'bg-slate-100'
                    }`}
                  >
                    🧠
                  </div>
                  <div>
                    <div className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      سؤال ديني
                    </div>
                    <div className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      بنك يحتوي على أكثر من {RELIGIOUS_QUESTIONS.length} سؤالاً إسلامياً
                    </div>
                  </div>
                </div>
                {missionType === 'religious_quiz' && (
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center mt-1">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}
              </div>

              {/* Sub-selector for Questions count */}
              {missionType === 'religious_quiz' && (
                <div
                  className={`mt-4 pt-3 border-t space-y-2 ${
                    isDark ? 'border-slate-800/80' : 'border-slate-200'
                  }`}
                >
                  <span className={`text-xs block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    كم سؤالاً تريد الإجابة عنه؟
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
                        className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          !isCustomReligiousCount && religiousQuestionsCount === cnt
                            ? 'bg-emerald-500 text-white'
                            : isDark
                            ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {cnt === 1 ? 'سؤال واحد' : cnt === 2 ? 'سؤالين' : `${cnt} أسئلة`}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsCustomReligiousCount(true);
                      }}
                      className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        isCustomReligiousCount
                          ? 'bg-emerald-500 text-white'
                          : isDark
                          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      مخصص
                    </button>
                  </div>

                  {isCustomReligiousCount && (
                    <div className="mt-2 flex items-center gap-2">
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
                        className={`w-20 py-1 px-2 rounded-lg border font-bold text-center text-sm focus:outline-none ${
                          isDark
                            ? 'bg-slate-950 border-emerald-500/60 text-white'
                            : 'bg-white border-emerald-500 text-slate-900 shadow-xs'
                        }`}
                      />
                      <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        أسئلة
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 4. سؤال رياضي */}
            <div
              onClick={() => setMissionType('math_quiz')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                missionType === 'math_quiz'
                  ? isDark
                    ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-md shadow-emerald-950'
                    : 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-sm'
                  : isDark
                  ? 'bg-slate-900/70 border-slate-800 hover:border-slate-700 text-slate-300'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${
                      isDark ? 'bg-slate-800/80' : 'bg-slate-100'
                    }`}
                  >
                    🔢
                  </div>
                  <div>
                    <div className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      سؤال رياضي
                    </div>
                    <div className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      حل مسائل حسابية لإيقاظ العقل بلطف
                    </div>
                  </div>
                </div>
                {missionType === 'math_quiz' && (
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center mt-1">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}
              </div>

              {/* Sub-selector for Math count & difficulty */}
              {missionType === 'math_quiz' && (
                <div
                  className={`mt-4 pt-3 border-t space-y-3 ${
                    isDark ? 'border-slate-800/80' : 'border-slate-200'
                  }`}
                >
                  <div>
                    <span className={`text-xs block mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
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
                          className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            !isCustomMathCount && mathQuestionsCount === cnt
                              ? 'bg-emerald-500 text-white'
                              : isDark
                              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {cnt === 1 ? 'مسألة واحدة' : cnt === 2 ? 'مسألتين' : `${cnt} مسائل`}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsCustomMathCount(true);
                        }}
                        className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          isCustomMathCount
                            ? 'bg-emerald-500 text-white'
                            : isDark
                            ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        مخصص
                      </button>
                    </div>

                    {isCustomMathCount && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          حدد عدد المسائل:
                        </span>
                        <input
                          type="number"
                          min="1"
                          max="15"
                          value={customMathInput}
                          onChange={(e) => setCustomMathInput(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className={`w-20 py-1 px-2 rounded-lg border font-bold text-center text-sm focus:outline-none ${
                            isDark
                              ? 'bg-slate-950 border-emerald-500/60 text-white'
                              : 'bg-white border-emerald-500 text-slate-900 shadow-xs'
                          }`}
                        />
                        <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          مسائل
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Difficulty selector */}
                  <div>
                    <span className={`text-xs block mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      مستوى الصعوبة:
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { key: 'easy', label: 'سهل (جمع خفيف)' },
                        { key: 'medium', label: 'متوسط (منشط للذهن)' },
                        { key: 'hard', label: 'متقدم (عمليات أكبر)' },
                      ].map((diff) => (
                        <button
                          key={diff.key}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMathDifficulty(diff.key as MathDifficulty);
                          }}
                          className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-colors cursor-pointer text-center ${
                            mathDifficulty === diff.key
                              ? 'bg-emerald-500 text-white'
                              : isDark
                              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
          </div>

          {/* Save Button */}
          <button
            onClick={handleFinish}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-base shadow-xl shadow-emerald-900/30 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>حفظ المنبه</span>
            <Check className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      )}
    </div>
  );
};
