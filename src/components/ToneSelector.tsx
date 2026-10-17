import React, { useState, useEffect } from 'react';
import { AlarmToneId, ALARM_TONES } from '../utils/fajrLogic';
import { soundService } from '../utils/soundService';
import { useTheme } from '../themeContext';
import { Check, Play, Square, Volume2 } from 'lucide-react';

interface ToneSelectorProps {
  selectedToneId: AlarmToneId;
  onSelectTone: (toneId: AlarmToneId) => void;
}

export const ToneSelector: React.FC<ToneSelectorProps> = ({ selectedToneId, onSelectTone }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [playingPreviewId, setPlayingPreviewId] = useState<AlarmToneId | null>(null);

  useEffect(() => {
    const unsubscribe = soundService.subscribePlayback((isPlaying, toneId) => {
      setPlayingPreviewId(isPlaying ? toneId : null);
    });

    return () => {
      unsubscribe();
      soundService.stopAlarmSound();
    };
  }, []);

  const handleCardClick = (toneId: AlarmToneId) => {
    onSelectTone(toneId);
    // When selecting, automatically play a preview so user hears it immediately!
    if (playingPreviewId === toneId) {
      soundService.stopAlarmSound();
    } else {
      soundService.previewTone(toneId);
    }
  };

  const handlePreviewButtonClick = (e: React.MouseEvent, toneId: AlarmToneId) => {
    e.stopPropagation();
    if (playingPreviewId === toneId) {
      soundService.stopAlarmSound();
    } else {
      onSelectTone(toneId);
      soundService.previewTone(toneId);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          اختر نغمة صوت المنبه (3 أصوات متاحة):
        </span>
        <span className={`text-[11px] font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
          اضغط على النغمة لسماعها واختيارها
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        {ALARM_TONES.map((tone) => {
          const isSelected = selectedToneId === tone.id;
          const isPlaying = playingPreviewId === tone.id;

          return (
            <div
              key={tone.id}
              onClick={() => handleCardClick(tone.id)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                isSelected
                  ? isDark
                    ? 'bg-emerald-950/50 border-emerald-500 text-white shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/40'
                    : 'bg-emerald-50/90 border-emerald-500 text-emerald-950 shadow-sm ring-1 ring-emerald-500/30'
                  : isDark
                  ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xl transition-all ${
                    isPlaying
                      ? 'bg-emerald-500 text-white animate-pulse'
                      : isDark
                      ? 'bg-slate-800/90'
                      : 'bg-slate-100'
                  }`}
                >
                  {tone.icon}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {tone.title}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 font-bold ${
                        isSelected
                          ? isDark
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-emerald-200/60 text-emerald-900'
                          : isDark
                          ? 'bg-slate-800 text-slate-400'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {tone.durationLabel}
                    </span>
                  </div>
                  <p className={`text-xs mt-1 line-clamp-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {tone.subtitle}
                  </p>
                  {isPlaying && (
                    <div className="flex items-center gap-1.5 mt-1 text-[11px] font-bold text-emerald-500">
                      <Volume2 className="w-3.5 h-3.5 animate-bounce" />
                      <span>الصوت يشتغل الآن...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action button: Explicit Listen/Stop button + selection check */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={(e) => handlePreviewButtonClick(e, tone.id)}
                  aria-label={isPlaying ? 'إيقاف الصوت' : 'استماع للنغمة'}
                  title={isPlaying ? 'إيقاف الصوت' : 'استماع للنغمة'}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isPlaying
                      ? 'bg-emerald-500 text-white shadow-md animate-pulse'
                      : isDark
                      ? 'bg-slate-800 text-emerald-400 hover:bg-slate-700 hover:text-emerald-300 border border-slate-700'
                      : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200 shadow-xs'
                  }`}
                >
                  {isPlaying ? (
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

                {isSelected ? (
                  <div
                    title="النغمة المحددة حالياً"
                    className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                ) : (
                  <div
                    title="انقر لاختيار هذه النغمة"
                    className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${
                      isDark ? 'border-slate-700' : 'border-slate-300'
                    }`}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
