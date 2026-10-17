import React, { useState, useEffect } from 'react';
import {
  AlarmConfig,
  DHIKR_AWAKENING,
  getDistinctReligiousQuestions,
  generateMathProblem,
  checkMathAnswer,
  QuizQuestion,
  MathProblem,
  ALARM_TONES,
  EMERGENCY_PENALTY_CONFIG,
} from '../utils/fajrLogic';
import { soundService } from '../utils/soundService';
import { useTheme } from '../themeContext';
import { Bell, Check, Sparkles, Volume2, VolumeX, ArrowLeft, ShieldAlert } from 'lucide-react';
import { BarcodeMissionScanner } from './BarcodeMissionScanner';

interface RingingScreenProps {
  config: AlarmConfig;
  onDismiss: () => void;
}

export const RingingScreen: React.FC<RingingScreenProps> = ({ config, onDismiss }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // State for overall mission completion
  const [isCompleted, setIsCompleted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isAutoplayBlocked, setIsAutoplayBlocked] = useState(false);

  // Walk-to-target 45s grace mute timer state
  const [graceSecondsRemaining, setGraceSecondsRemaining] = useState(0);
  const [graceUsesCount, setGraceUsesCount] = useState(0);

  // Emergency Penalty Fallback state ('none' | 'math' | 'tasbih')
  const [emergencyPenaltyPhase, setEmergencyPenaltyPhase] = useState<'none' | 'math' | 'tasbih'>('none');

  // Tasbih state
  const [tasbihCurrent, setTasbihCurrent] = useState(0);
  const targetTasbihCount =
    emergencyPenaltyPhase === 'tasbih'
      ? EMERGENCY_PENALTY_CONFIG.penaltyTasbihCount
      : config.tasbihCount;

  // Religious Quiz state (multiple questions support)
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizError, setQuizError] = useState<string | null>(null);

  // Math Quiz state (multiple problems support)
  const [mathQuestionsTotal, setMathQuestionsTotal] = useState(config.mathQuestionsCount || 1);
  const [currentMathIndex, setCurrentMathIndex] = useState(0);
  const [mathProblem, setMathProblem] = useState<MathProblem>(
    generateMathProblem(config.mathDifficulty || 'medium')
  );
  const [mathInput, setMathInput] = useState('');
  const [mathError, setMathError] = useState<string | null>(null);

  // Start peaceful waking chime on mount & prepare questions
  useEffect(() => {
    soundService.startAlarmSound(config.selectedToneId);

    const unsubscribeAutoplay = soundService.subscribeAutoplayBlocked((blocked) => {
      setIsAutoplayBlocked(blocked);
    });

    const targetQuizCount = config.religiousQuestionsCount || 1;
    const questions = getDistinctReligiousQuestions(targetQuizCount);
    setQuizQuestions(questions);
    setCurrentQuizIndex(0);

    setMathQuestionsTotal(config.mathQuestionsCount || 1);
    setCurrentMathIndex(0);
    setMathProblem(generateMathProblem(config.mathDifficulty || 'medium'));

    return () => {
      unsubscribeAutoplay();
      soundService.stopAlarmSound();
    };
  }, [config]);

  // Walk-to-target Grace Mute countdown effect
  useEffect(() => {
    if (graceSecondsRemaining <= 0 || isCompleted) return;

    const timer = setTimeout(() => {
      if (graceSecondsRemaining <= 1) {
        setGraceSecondsRemaining(0);
        setIsMuted(false);
        soundService.startAlarmSound(config.selectedToneId);
      } else {
        setGraceSecondsRemaining(graceSecondsRemaining - 1);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [graceSecondsRemaining, isCompleted, config.selectedToneId]);

  const handleTriggerGraceMute = () => {
    if (graceUsesCount >= EMERGENCY_PENALTY_CONFIG.maxGraceMuteUses) return;
    soundService.stopAlarmSound();
    setIsMuted(true);
    setGraceUsesCount((prev) => prev + 1);
    setGraceSecondsRemaining(EMERGENCY_PENALTY_CONFIG.graceMuteSeconds);
  };

  const handleTriggerEmergencyPenalty = () => {
    setEmergencyPenaltyPhase('math');
    setMathQuestionsTotal(EMERGENCY_PENALTY_CONFIG.penaltyMathCount);
    setCurrentMathIndex(0);
    setMathInput('');
    setMathError(null);
    setMathProblem(generateMathProblem(EMERGENCY_PENALTY_CONFIG.penaltyMathDifficulty));
  };

  const handleMuteToggle = () => {
    if (isMuted) {
      setGraceSecondsRemaining(0);
      soundService.startAlarmSound(config.selectedToneId);
      setIsMuted(false);
    } else {
      soundService.stopAlarmSound();
      setIsMuted(true);
    }
  };

  const handleCompleteMission = () => {
    setGraceSecondsRemaining(0);
    soundService.stopAlarmSound();
    soundService.playSuccessSound();
    setIsCompleted(true);
  };

  // TASBIH TAP
  const handleTasbihTap = () => {
    soundService.playTasbihTick();
    const next = tasbihCurrent + 1;
    setTasbihCurrent(next);
    if (next >= targetTasbihCount) {
      handleCompleteMission();
    }
  };

  // DHIKR CONFIRMATION
  const handleDhikrConfirm = () => {
    handleCompleteMission();
  };

  // QUIZ SELECTION
  const handleQuizAnswer = (optionIdx: number) => {
    setSelectedOption(optionIdx);
    const activeQuestion = quizQuestions[currentQuizIndex];
    if (!activeQuestion) return;

    if (optionIdx === activeQuestion.correctIndex) {
      setQuizError(null);
      soundService.playSuccessSound();

      if (currentQuizIndex + 1 < quizQuestions.length) {
        // Move to next question after small pause
        setTimeout(() => {
          setSelectedOption(null);
          setCurrentQuizIndex((prev) => prev + 1);
        }, 500);
      } else {
        // All quiz questions completed!
        handleCompleteMission();
      }
    } else {
      soundService.playGentleErrorSound();
      setQuizError('❌ إجابة غير صحيحة، حاول مرة أخرى.');
    }
  };

  // MATH VERIFY
  const handleMathVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const activeDifficulty =
      emergencyPenaltyPhase === 'math'
        ? EMERGENCY_PENALTY_CONFIG.penaltyMathDifficulty
        : config.mathDifficulty || 'medium';

    if (checkMathAnswer(mathInput, mathProblem.answer)) {
      setMathError(null);
      soundService.playSuccessSound();

      if (currentMathIndex + 1 < mathQuestionsTotal) {
        // Move to next math problem
        setMathInput('');
        setCurrentMathIndex((prev) => prev + 1);
        setMathProblem(generateMathProblem(activeDifficulty));
      } else if (emergencyPenaltyPhase === 'math') {
        // Transition from Emergency Phase 1 (Math) to Phase 2 (33 Tasbihs)
        setTasbihCurrent(0);
        setEmergencyPenaltyPhase('tasbih');
      } else {
        // All math questions completed!
        handleCompleteMission();
      }
    } else {
      soundService.playGentleErrorSound();
      setMathError('❌ الناتج غير صحيح، حاول مرة أخرى.');
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col justify-between p-6 select-none overflow-y-auto transition-colors ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Top subtle controls */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between opacity-80 hover:opacity-100 transition-opacity">
        <button
          onClick={handleMuteToggle}
          className={`p-2.5 rounded-full border transition-colors cursor-pointer ${
            isDark
              ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 shadow-xs'
          }`}
          title={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
          aria-label={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <Volume2 className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
          )}
        </button>

        <button
          onClick={onDismiss}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
            isDark
              ? 'text-slate-400 hover:text-slate-200 bg-slate-900 border-slate-800'
              : 'text-slate-600 hover:text-slate-900 bg-white border-slate-200 shadow-xs'
          }`}
        >
          إغلاق التجربة ✕
        </button>
      </div>

      {/* Main Body */}
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col items-center justify-center my-4 text-center">
        {/* Animated Bell Header */}
        <div className="relative mb-4">
          <div
            className={`w-20 h-20 rounded-full border flex items-center justify-center animate-bounce duration-1000 ${
              isDark
                ? 'bg-emerald-500/10 border-emerald-500/20'
                : 'bg-emerald-50 border-emerald-200 shadow-sm'
            }`}
          >
            <Bell
              className={`w-10 h-10 ${
                isDark ? 'text-emerald-400 fill-emerald-400/20' : 'text-emerald-600 fill-emerald-100'
              }`}
            />
          </div>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
          </span>
        </div>

        <h1 className={`text-3xl font-extrabold tracking-tight mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          حان وقت الاستيقاظ
        </h1>

        <div className={`font-bold text-lg mb-2 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
          صلاة الفجر
        </div>

        {(() => {
          const tone = ALARM_TONES.find((t) => t.id === config.selectedToneId) || ALARM_TONES[0];
          return (
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3 border ${
                isDark
                  ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-300'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5 animate-pulse text-emerald-500" />
              <span>صوت المنبه: {tone.title}</span>
            </div>
          );
        })()}

        {isAutoplayBlocked && (
          <button
            type="button"
            onClick={() => {
              soundService.unlockAudioContext();
              soundService.startAlarmSound(config.selectedToneId);
              setIsAutoplayBlocked(false);
              setIsMuted(false);
            }}
            className="w-full max-w-sm mb-4 py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg animate-bounce cursor-pointer transition-all"
          >
            <Volume2 className="w-5 h-5 fill-current" />
            <span>اضغط هنا لتشغيل صوت المنبه 🔊</span>
          </button>
        )}

        <div
          className={`w-24 h-0.5 bg-gradient-to-r from-transparent to-transparent mb-6 ${
            isDark ? 'via-slate-700' : 'via-slate-300'
          }`}
        />

        {/* MISSION CONTAINER */}
        {isCompleted ? (
          /* SUCCESS STATE */
          <div
            className={`w-full border rounded-3xl p-6 shadow-2xl flex flex-col items-center animate-fadeIn ${
              isDark
                ? 'bg-emerald-950/40 border-emerald-500/40'
                : 'bg-white border-emerald-300 shadow-emerald-100'
            }`}
          >
            <div className="text-5xl mb-3">🌅</div>
            <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>أحسنت</h2>
            <p className={`font-medium text-lg mb-6 ${isDark ? 'text-emerald-300' : 'text-emerald-800'}`}>
              استعد لصلاة الفجر وتقبل الله طاعتك.
            </p>
            <button
              onClick={onDismiss}
              className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg shadow-xl shadow-emerald-900/30 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5 stroke-[3]" />
              <span>تم الاستيقاظ — العودة للرئيسية</span>
            </button>
          </div>
        ) : (
          /* ACTIVE MISSION STATES */
          <div className="w-full">
            {/* Emergency Penalty Active Banner */}
            {emergencyPenaltyPhase !== 'none' && (
              <div
                className={`mb-4 p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 ${
                  isDark
                    ? 'bg-rose-950/60 border-rose-700/60 text-rose-200'
                    : 'bg-rose-50 border-rose-300 text-rose-900'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <span>
                  مهمة الطوارئ البديلة:{' '}
                  {emergencyPenaltyPhase === 'math'
                    ? `المرحلة 1/2 (${EMERGENCY_PENALTY_CONFIG.penaltyMathCount} مسائل حسابية متقدمة)`
                    : `المرحلة 2/2 (${EMERGENCY_PENALTY_CONFIG.penaltyTasbihCount} تسبيحة)`}
                </span>
              </div>
            )}

            {/* 1. TASBIH MISSION (or Emergency Phase 2) */}
            {(config.missionType === 'tasbih' || emergencyPenaltyPhase === 'tasbih') && (
              <div className="flex flex-col items-center">
                <div className="text-4xl mb-2">📿</div>
                <div className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {config.tasbihPhrase || 'سبحان الله'}
                </div>

                <div
                  className={`text-3xl font-extrabold mb-6 font-mono tracking-wider ${
                    isDark ? 'text-emerald-400' : 'text-emerald-700'
                  }`}
                >
                  {tasbihCurrent} / {targetTasbihCount}
                </div>

                <button
                  type="button"
                  onClick={handleTasbihTap}
                  className="w-36 h-36 rounded-full bg-gradient-to-b from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xl shadow-2xl shadow-emerald-950/40 border-4 border-emerald-400/40 active:scale-95 transition-transform flex flex-col items-center justify-center gap-1 cursor-pointer"
                >
                  <Check className="w-8 h-8 stroke-[3]" />
                  <span>تسبيح</span>
                </button>

                <p className={`text-xs mt-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  اضغط {targetTasbihCount} مرات لإيقاف المنبه
                </p>
              </div>
            )}

            {/* 2. DHIKR MISSION */}
            {config.missionType === 'dhikr' && (
              <div className="flex flex-col items-center">
                <div
                  className={`w-full border rounded-3xl p-6 shadow-xl mb-6 ${
                    isDark
                      ? 'bg-slate-900/90 border-slate-800'
                      : 'bg-white border-slate-200/90 shadow-slate-200/50'
                  }`}
                >
                  <div className={`text-xs font-semibold mb-3 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                    أذكار الاستيقاظ من النوم
                  </div>
                  <p
                    className={`text-xl sm:text-2xl font-serif leading-relaxed font-medium mb-3 ${
                      isDark ? 'text-slate-100' : 'text-slate-900'
                    }`}
                  >
                    «{DHIKR_AWAKENING.text}»
                  </p>
                  <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    {DHIKR_AWAKENING.source}
                  </div>
                </div>

                <button
                  onClick={handleDhikrConfirm}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-lg shadow-xl shadow-emerald-900/30 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <Check className="w-5 h-5 stroke-[2.5]" />
                  <span>أتممت الذكر</span>
                </button>

                <p className={`text-xs mt-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  أكمل الذكر لإيقاف المنبه
                </p>
              </div>
            )}

            {/* 3. RELIGIOUS QUIZ MISSION */}
            {config.missionType === 'religious_quiz' && quizQuestions.length > 0 && (
              <div className="flex flex-col items-center w-full">
                {/* Progress banner */}
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full border ${
                      isDark
                        ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60'
                        : 'text-emerald-800 bg-emerald-50 border-emerald-200'
                    }`}
                  >
                    سؤال {currentQuizIndex + 1} من {quizQuestions.length}
                  </span>
                </div>

                <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {quizQuestions[currentQuizIndex]?.question}
                </h3>

                <div className="w-full flex flex-col gap-2.5 mb-4">
                  {quizQuestions[currentQuizIndex]?.options.map((option, idx) => {
                    const isSelected = selectedOption === idx;
                    const isCorrect = idx === quizQuestions[currentQuizIndex]?.correctIndex;

                    return (
                      <button
                        key={idx}
                        onClick={() => handleQuizAnswer(idx)}
                        className={`w-full py-3.5 px-4 rounded-xl text-right font-medium text-sm transition-all border cursor-pointer ${
                          isSelected && isCorrect
                            ? 'bg-emerald-900/60 border-emerald-500 text-white'
                            : isSelected && !isCorrect
                            ? 'bg-rose-950/40 border-rose-800 text-rose-200'
                            : isDark
                            ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-200'
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800 shadow-xs'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs ${
                              isDark ? 'border-slate-700 text-slate-400' : 'border-slate-300 text-slate-500'
                            }`}
                          >
                            ○
                          </span>
                          <span>{option}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {quizError && (
                  <div className="text-amber-500 font-medium text-sm mb-3">
                    {quizError}
                  </div>
                )}

                <div className={`w-full h-px my-2 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  أجب بشكل صحيح لإيقاف المنبه
                </p>
              </div>
            )}

            {/* 4. MATH QUIZ MISSION (or Emergency Phase 1) */}
            {(config.missionType === 'math_quiz' || emergencyPenaltyPhase === 'math') && (
              <div className="flex flex-col items-center w-full">
                {/* Progress banner */}
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full border ${
                      isDark
                        ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60'
                        : 'text-emerald-800 bg-emerald-50 border-emerald-200'
                    }`}
                  >
                    مسألة {currentMathIndex + 1} من {mathQuestionsTotal}
                  </span>
                </div>

                <div
                  className={`text-4xl font-extrabold font-mono tracking-wider mb-4 dir-ltr ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {mathProblem.num1} {mathProblem.op} {mathProblem.num2}
                </div>

                <form onSubmit={handleMathVerify} className="w-full flex flex-col items-center gap-3 mb-4">
                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={mathInput}
                    onChange={(e) => setMathInput(e.target.value)}
                    placeholder="اكتب الناتج هنا"
                    autoFocus
                    className={`w-full max-w-xs py-3.5 px-4 rounded-xl border text-center text-2xl font-bold focus:outline-none focus:border-emerald-500 ${
                      isDark
                        ? 'bg-slate-900 border-slate-700 text-white'
                        : 'bg-white border-slate-300 text-slate-900 shadow-xs'
                    }`}
                  />

                  <button
                    type="submit"
                    className="w-full max-w-xs py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base transition-colors cursor-pointer"
                  >
                    تحقق
                  </button>
                </form>

                {mathError && (
                  <div className="text-amber-500 font-medium text-sm mb-3">
                    {mathError}
                  </div>
                )}

                <div className={`w-full h-px my-2 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {emergencyPenaltyPhase === 'math'
                    ? 'أكمل المسائل الخمس للانتقال لمرحلة التسبيح وإيقاف المنبه'
                    : 'حل المسألة بشكل صحيح لإيقاف المنبه'}
                </p>
              </div>
            )}

            {/* 5. BARCODE & WUDU STATION MISSION */}
            {config.missionType === 'barcode' && emergencyPenaltyPhase === 'none' && (
              <div className="flex flex-col items-center w-full">
                <BarcodeMissionScanner
                  expectedCode={config.barcodeValue || 'WUDU-TOOTHPASTE-786'}
                  expectedLabel={config.barcodeLabel || 'معجون الأسنان بالحمام 🪥'}
                  onCompleted={handleCompleteMission}
                  graceSecondsRemaining={graceSecondsRemaining}
                  graceUsesCount={graceUsesCount}
                  onTriggerGraceMute={handleTriggerGraceMute}
                  onTriggerEmergencyPenalty={handleTriggerEmergencyPenalty}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer subtle tip */}
      <div className="w-full max-w-md mx-auto text-center">
        <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          «الصلاة خير من النوم»
        </p>
      </div>
    </div>
  );
};
