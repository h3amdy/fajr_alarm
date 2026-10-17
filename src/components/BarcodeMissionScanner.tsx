import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  QrCode,
  Flashlight,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Footprints,
  VolumeX,
  ShieldAlert,
  Terminal,
  Printer,
} from 'lucide-react';
import { useTheme } from '../themeContext';
import {
  verifyBarcodeMatch,
  EMERGENCY_PENALTY_CONFIG,
} from '../utils/fajrLogic';
import { soundService } from '../utils/soundService';

interface BarcodeMissionScannerProps {
  expectedCode?: string;
  expectedLabel?: string;
  onCompleted: () => void;
  isSetupMode?: boolean;
  onCodeScannedInSetup?: (code: string, label: string) => void;
  onCancelSetupScan?: () => void;
  // Walk-to-target grace timer callbacks (for RingingScreen)
  graceSecondsRemaining?: number;
  graceUsesCount?: number;
  onTriggerGraceMute?: () => void;
  // Emergency penalty fallback callback (for RingingScreen)
  onTriggerEmergencyPenalty?: () => void;
}

export const BarcodeMissionScanner: React.FC<BarcodeMissionScannerProps> = ({
  expectedCode = 'WUDU-TOOTHPASTE-786',
  expectedLabel = 'معجون الأسنان بالحمام 🪥',
  onCompleted,
  isSetupMode = false,
  onCodeScannedInSetup,
  onCancelSetupScan,
  graceSecondsRemaining = 0,
  graceUsesCount = 0,
  onTriggerGraceMute,
  onTriggerEmergencyPenalty,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isDetectingRef = useRef<boolean>(false);

  const [hasCamera, setHasCamera] = useState<boolean>(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [torchEnabled, setTorchEnabled] = useState<boolean>(false);
  const [hasTorchSupport, setHasTorchSupport] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [mismatchError, setMismatchError] = useState<string | null>(null);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [setupCustomCodeInput, setSetupCustomCodeInput] = useState<string>(expectedCode);
  const [showEmergencyConfirm, setShowEmergencyConfirm] = useState<boolean>(false);

  // Initialize camera stream
  useEffect(() => {
    let isMounted = true;

    async function startCamera() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('الكاميرا غير مدعومة في هذا المتصفح');
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }

        const track = stream.getVideoTracks()[0];
        const capabilities = track?.getCapabilities
          ? (track.getCapabilities() as Record<string, unknown>)
          : {};
        if ('torch' in capabilities) {
          setHasTorchSupport(true);
        }

        setHasCamera(true);
        setCameraError(null);
      } catch (err: unknown) {
        if (isMounted) {
          setHasCamera(false);
          setCameraError(
            err instanceof Error && err.name === 'NotAllowedError'
              ? 'تم حظر إذن الكاميرا. يرجى تفعيل الكاميرا أو استخدام أدوات الفحص أدناه.'
              : 'الكاميرا الخلفية غير متصلة حالياً على هذا الجهاز.'
          );
        }
      }
    }

    startCamera();

    return () => {
      isMounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // Torch toggle handler
  const handleToggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;

    try {
      const nextTorch = !torchEnabled;
      await (track.applyConstraints as (c: unknown) => Promise<void>)({
        advanced: [{ torch: nextTorch }],
      });
      setTorchEnabled(nextTorch);
    } catch {
      // Ignored if hardware rejects torch
    }
  };

  // Throttled BarcodeDetector loop (every 250ms with non-overlapping lock)
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let barcodeDetector: {
      detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue: string }>>;
    } | null = null;

    interface WindowWithBarcodeDetector extends Window {
      BarcodeDetector?: new (options?: { formats: string[] }) => {
        detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue: string }>>;
      };
    }

    const CustomWindow = window as WindowWithBarcodeDetector;

    if (typeof CustomWindow.BarcodeDetector !== 'undefined') {
      try {
        barcodeDetector = new CustomWindow.BarcodeDetector({
          formats: ['qr_code', 'ean_13', 'ean_8', 'code_128', 'code_39', 'upc_a', 'upc_e'],
        });
      } catch (e) {
        console.warn('BarcodeDetector init error:', e);
      }
    }

    if (barcodeDetector) {
      intervalId = setInterval(async () => {
        if (
          isDetectingRef.current ||
          isSuccess ||
          !videoRef.current ||
          videoRef.current.readyState < 2
        ) {
          return;
        }

        isDetectingRef.current = true;
        try {
          const detected = await barcodeDetector.detect(videoRef.current);
          if (detected && detected.length > 0 && detected[0].rawValue) {
            handleCodeTrigger(detected[0].rawValue);
          }
        } catch {
          // Frame error ignored
        } finally {
          isDetectingRef.current = false;
        }
      }, 250);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isSuccess, expectedCode, expectedLabel, isSetupMode]);

  // Strict Code Verification & Setup Registration Handler
  const handleCodeTrigger = (codeValue: string) => {
    if (isSuccess) return;

    const cleanCode = codeValue.trim().toUpperCase();
    if (!cleanCode) return;

    setLastScannedCode(cleanCode);

    // 1. Setup / Onboarding Mode: Register any scanned barcode
    if (isSetupMode) {
      setMismatchError(null);
      setIsSuccess(true);
      soundService.playSuccessSound();
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([60, 40, 100]);
      }
      setTimeout(() => {
        if (onCodeScannedInSetup) {
          onCodeScannedInSetup(cleanCode, expectedLabel);
        }
        onCompleted();
      }, 600);
      return;
    }

    // 2. Ringing Enforcement Mode: STRICT barcode verification
    const verification = verifyBarcodeMatch(cleanCode, expectedCode, expectedLabel);

    if (verification.isValid) {
      setMismatchError(null);
      setIsSuccess(true);
      soundService.playSuccessSound();
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([80, 50, 160]);
      }
      setTimeout(() => {
        onCompleted();
      }, 700);
    } else {
      // Mismatched barcode! Reject and alert user
      soundService.playGentleErrorSound();
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
      setMismatchError(
        verification.errorReason ||
          'الباركود الممسوح غير مطابق للهدف المسجّل!'
      );
    }
  };

  const remainingGraceAttempts =
    EMERGENCY_PENALTY_CONFIG.maxGraceMuteUses - graceUsesCount;

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* Target Mission Destination Card */}
      <div
        className={`w-full max-w-sm mb-3 p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
          isDark
            ? 'bg-slate-900/90 border-slate-800 text-slate-200'
            : 'bg-white border-slate-200 text-slate-800 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
              isDark
                ? 'bg-emerald-950/80 border border-emerald-800/60'
                : 'bg-emerald-50 border border-emerald-200'
            }`}
          >
            {expectedLabel.includes('🪥')
              ? '🪥'
              : expectedLabel.includes('📖')
              ? '📖'
              : expectedLabel.includes('🥛')
              ? '🥛'
              : '📷'}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-bold mb-0.5">
              <Footprints className="w-3.5 h-3.5" />
              <span>{isSetupMode ? 'تسجيل باركود الهدف:' : 'الهدف المطلوب مسحه:'}</span>
            </div>
            <div
              className={`font-bold text-sm truncate ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              {expectedLabel}
            </div>
            <div className="text-[11px] font-mono text-emerald-500/90 truncate dir-ltr text-right">
              ID: {expectedCode}
            </div>
          </div>
        </div>
      </div>

      {/* Walk-to-Target 45-Second Grace Timer (Ringing Mode Only) */}
      {!isSetupMode && onTriggerGraceMute && (
        <div className="w-full max-w-sm mb-3">
          {graceSecondsRemaining > 0 ? (
            <div
              className={`p-3 rounded-2xl border flex flex-col gap-2 ${
                isDark
                  ? 'bg-amber-950/40 border-amber-700/60 text-amber-200'
                  : 'bg-amber-50 border-amber-300 text-amber-900'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5">
                  <VolumeX className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span>مهلة المشي لمكان الوضوء (الصوت مكتوم مؤقتاً)</span>
                </span>
                <span className="font-mono text-sm font-extrabold text-amber-400">
                  00:{String(graceSecondsRemaining).padStart(2, '0')}
                </span>
              </div>
              <div className="w-full h-1.5 bg-black/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 transition-all duration-1000"
                  style={{
                    width: `${
                      (graceSecondsRemaining /
                        EMERGENCY_PENALTY_CONFIG.graceMuteSeconds) *
                      100
                    }%`,
                  }}
                />
              </div>
              <p className="text-[11px] opacity-85">
                امسح الباركود قبل انتهاء المهلة وإلا سيعود الرنين بأعلى صوت!
              </p>
            </div>
          ) : (
            <button
              type="button"
              disabled={remainingGraceAttempts <= 0}
              onClick={onTriggerGraceMute}
              className={`w-full py-2.5 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${
                remainingGraceAttempts > 0
                  ? isDark
                    ? 'bg-slate-900 hover:bg-slate-800 border-amber-500/40 text-amber-300 cursor-pointer'
                    : 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900 cursor-pointer shadow-2xs'
                  : 'opacity-40 cursor-not-allowed border-slate-800 text-slate-500'
              }`}
            >
              <span className="flex items-center gap-2">
                <Footprints className="w-4 h-4 text-amber-400" />
                <span>
                  أمهلني {EMERGENCY_PENALTY_CONFIG.graceMuteSeconds} ثانية للوصول للمكان (كتم مؤقت)
                </span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                {remainingGraceAttempts > 0
                  ? `متبقي ${remainingGraceAttempts}`
                  : 'نفدت المهلة'}
              </span>
            </button>
          )}
        </div>
      )}

      {/* Strict Mismatch Error Alert */}
      {mismatchError && (
        <div
          role="alert"
          className="w-full max-w-sm mb-3 p-3.5 rounded-2xl bg-rose-950/90 border-2 border-rose-500 text-rose-100 text-xs leading-relaxed flex items-start gap-2.5 shadow-lg transition-all"
        >
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-bold text-rose-300 mb-0.5">
              تم رفض الباركود الممسوح!
            </div>
            <div>{mismatchError}</div>
          </div>
        </div>
      )}

      {/* Camera Viewfinder & HUD Frame */}
      <div className="relative w-full max-w-sm aspect-4/3 rounded-3xl overflow-hidden bg-black shadow-2xl border border-slate-800 mb-3 flex items-center justify-center">
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            hasCamera ? 'opacity-100' : 'opacity-20'
          }`}
        />

        {!hasCamera && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white bg-slate-950/90">
            <QrCode className="w-14 h-14 text-emerald-400 mb-2 opacity-80 animate-pulse" />
            <p className="text-xs text-slate-300 max-w-xs leading-relaxed">
              {cameraError || 'وجّه كاميرا الهاتف نحو الباركود المسجل'}
            </p>
          </div>
        )}

        {/* Animated Scanning Laser Line */}
        {!isSuccess && (
          <div className="absolute inset-x-8 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-bounce pointer-events-none" />
        )}

        {/* HUD Target Reticle / Corners */}
        <div className="absolute inset-8 border-2 border-emerald-500/30 rounded-2xl pointer-events-none flex flex-col justify-between p-2">
          <div className="flex justify-between">
            <div className="w-5 h-5 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
            <div className="w-5 h-5 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/65 backdrop-blur-md border border-white/20 text-white text-[11px] font-medium">
              <Camera className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {isSetupMode
                  ? 'وجّه الكاميرا لتسجيل باركود الغرض'
                  : `امسح الرمز المطابق: ${expectedCode}`}
              </span>
            </div>
          </div>

          <div className="flex justify-between">
            <div className="w-5 h-5 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
            <div className="w-5 h-5 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />
          </div>
        </div>

        {/* Torch toggle button */}
        {hasTorchSupport && (
          <button
            type="button"
            onClick={handleToggleTorch}
            className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md border transition-all cursor-pointer ${
              torchEnabled
                ? 'bg-amber-500 text-white border-amber-400 shadow-lg shadow-amber-500/40'
                : 'bg-black/60 text-white/80 border-white/20 hover:text-white'
            }`}
            title="تشغيل كشاف الهاتف في الظلام"
          >
            <Flashlight className="w-4 h-4" />
          </button>
        )}

        {/* Success Splash Overlay */}
        {isSuccess && (
          <div className="absolute inset-0 bg-emerald-950/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/50 mb-3 animate-bounce">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>
            <h4 className="text-lg font-bold text-white mb-1">
              {isSetupMode ? 'تم تسجيل الباركود بنجاح!' : 'تطابق تام — تم التحقق بنجاح!'}
            </h4>
            <p className="text-xs text-emerald-200 leading-relaxed max-w-xs">
              {isSetupMode
                ? `تم حفظ الرمز (${lastScannedCode}) كهدف استيقاظ رسمي.`
                : `الحمد لله، أنت الآن عند ${expectedLabel} واستيقظت تماماً.`}
            </p>
          </div>
        )}
      </div>

      {/* SETUP MODE: Register Custom Serial / EAN-13 Input */}
      {isSetupMode && (
        <div
          className={`w-full max-w-sm p-3.5 rounded-2xl border mb-3 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <label
            className={`block text-xs font-bold mb-2 ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}
          >
            أو أدخل الرقم التسلسلي للباركود (EAN-13 / QR) لحفظه:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={setupCustomCodeInput}
              onChange={(e) => setSetupCustomCodeInput(e.target.value)}
              placeholder="مثال: 6281000456789"
              className={`flex-1 py-2 px-3 rounded-xl border text-xs font-mono dir-ltr text-left focus:outline-none focus:border-emerald-500 ${
                isDark
                  ? 'bg-slate-950 border-slate-700 text-white'
                  : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
            <button
              type="button"
              onClick={() => handleCodeTrigger(setupCustomCodeInput)}
              className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shrink-0"
            >
              تأكيد وحفظ الرمز
            </button>
          </div>
          {onCancelSetupScan && (
            <button
              type="button"
              onClick={onCancelSetupScan}
              className="w-full mt-2 py-1.5 text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              إلغاء والعودة
            </button>
          )}
        </div>
      )}

      {/* RINGING MODE: Emergency Penalty Fallback Mission */}
      {!isSetupMode && onTriggerEmergencyPenalty && (
        <div className="w-full max-w-sm mb-3">
          {!showEmergencyConfirm ? (
            <button
              type="button"
              onClick={() => setShowEmergencyConfirm(true)}
              className={`w-full py-2.5 px-3 rounded-xl border text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                isDark
                  ? 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-rose-300 hover:border-rose-900/60'
                  : 'border-slate-200 bg-slate-100 text-slate-600 hover:text-rose-700'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>فقدت الغرض أو تعطلت الكاميرا؟ (مهمة الطوارئ البديلة)</span>
            </button>
          ) : (
            <div
              className={`p-3.5 rounded-2xl border text-xs space-y-2.5 ${
                isDark
                  ? 'bg-rose-950/30 border-rose-800/60 text-rose-200'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              <div className="font-bold flex items-center gap-1.5 text-rose-400">
                <ShieldAlert className="w-4 h-4" />
                <span>تأكيد الانتقال لمهمة الطوارئ المشددة:</span>
              </div>
              <p className="leading-relaxed opacity-90">
                لمنع التحايل على مغادرة الفراش، تتطلب مهمة الطوارئ البديلة حل{' '}
                <strong>{EMERGENCY_PENALTY_CONFIG.penaltyMathCount} مسائل حسابية متقدمة</strong>{' '}
                بالإضافة إلى إتمام{' '}
                <strong>{EMERGENCY_PENALTY_CONFIG.penaltyTasbihCount} تسبيحة</strong> لإيقاف
                المنبه.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={onTriggerEmergencyPenalty}
                  className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer"
                >
                  بدء مهمة الطوارئ الشاقة
                </button>
                <button
                  type="button"
                  onClick={() => setShowEmergencyConfirm(false)}
                  className="py-2 px-3 rounded-xl border border-slate-700 text-slate-400 hover:text-white cursor-pointer"
                >
                  تراجع
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Collapsible Desktop / Developer Hardware Simulation Panel */}
      {!isSetupMode && (
        <details
          className={`w-full max-w-sm rounded-2xl border p-3 text-xs transition-colors ${
            isDark
              ? 'bg-slate-900/50 border-slate-800/80 text-slate-400'
              : 'bg-slate-100/80 border-slate-200 text-slate-600'
          }`}
        >
          <summary className="font-bold cursor-pointer flex items-center justify-between select-none">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-emerald-500" />
              <span>محاكاة الكاميرا (للاختبار على الحاسوب بدون كاميرا)</span>
            </span>
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          </summary>

          <div className="mt-3 pt-2.5 border-t border-slate-800/60 space-y-2">
            <p className="text-[11px] opacity-80">
              اختبر نظام التحقق الصارم عبر محاكاة توجيه الكاميرا نحو الباركود المسجل أو نحو غرض خاطئ:
            </p>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleCodeTrigger(expectedCode)}
                className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer flex items-center justify-between ${
                  isDark
                    ? 'bg-emerald-950/50 border-emerald-700/60 hover:bg-emerald-900/60 text-emerald-200'
                    : 'bg-emerald-50 border-emerald-300 hover:bg-emerald-100 text-emerald-900'
                }`}
              >
                <span className="font-bold">
                  ✅ محاكاة مسح الباركود الصحيح ({expectedLabel})
                </span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20">
                  {expectedCode}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleCodeTrigger('WRONG-BEDSIDE-ITEM-000')}
                className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer flex items-center justify-between ${
                  isDark
                    ? 'bg-rose-950/40 border-rose-800/50 hover:bg-rose-900/50 text-rose-300'
                    : 'bg-rose-50 border-rose-200 hover:bg-rose-100 text-rose-900'
                }`}
              >
                <span className="font-bold">
                  ❌ محاكاة مسح باركود خاطئ بجانب السرير
                </span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20">
                  يرفض الإيقاف
                </span>
              </button>
            </div>
          </div>
        </details>
      )}
    </div>
  );
};
