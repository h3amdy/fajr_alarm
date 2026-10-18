import React, { useState } from 'react';
import {
  Camera,
  Check,
  QrCode,
  Printer,
  Copy,
  Sparkles,
} from 'lucide-react';
import { useTheme } from '../themeContext';
import { BARCODE_PRESETS } from '../utils/fajrLogic';
import { BarcodeMissionScanner } from './BarcodeMissionScanner';

interface BarcodeSetupConfiguratorProps {
  barcodeValue: string;
  barcodeLabel: string;
  onChangeBarcode: (newCode: string, newLabel: string) => void;
}

export const BarcodeSetupConfigurator: React.FC<BarcodeSetupConfiguratorProps> = ({
  barcodeValue,
  barcodeLabel,
  onChangeBarcode,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [showPrintableCard, setShowPrintableCard] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(barcodeValue);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div
      className={`mt-4 pt-3 border-t space-y-3 ${
        isDark ? 'border-slate-800/80' : 'border-slate-200'
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Active Registered Barcode Status Badge */}
      <div
        className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
          isDark
            ? 'bg-emerald-950/50 border-emerald-700/50 text-emerald-200'
            : 'bg-emerald-50 border-emerald-300 text-emerald-950'
        }`}
      >
        <div className="min-w-0">
          <div className="text-[11px] opacity-80">الباركود المسجل حالياً للمطابقة الفجرية:</div>
          <div className="font-bold text-xs truncate">{barcodeLabel}</div>
          <div className="font-mono text-xs font-extrabold text-emerald-400 dir-ltr text-right mt-0.5">
            {barcodeValue}
          </div>
        </div>
        <button
          type="button"
          onClick={handleCopyCode}
          className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold flex items-center gap-1 cursor-pointer shrink-0 ${
            isDark
              ? 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800'
              : 'bg-white border-emerald-300 text-emerald-800 hover:bg-emerald-100'
          }`}
        >
          {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedCode ? 'تم النسخ' : 'نسخ الرمز'}</span>
        </button>
      </div>

      {/* Step 1: Choose Preset Location */}
      <div>
        <span className={`text-xs block font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          1. اختر مكان الهدف خارج غرفة النوم:
        </span>
        <div className="grid grid-cols-1 gap-2">
          {BARCODE_PRESETS.map((preset) => {
            const isSelected = barcodeLabel.includes(preset.label);
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  onChangeBarcode(preset.code, `${preset.label} ${preset.icon}`);
                }}
                className={`w-full text-right p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  isSelected
                    ? isDark
                      ? 'bg-emerald-950/80 border-emerald-500 text-white'
                      : 'bg-emerald-100/70 border-emerald-500 text-emerald-950 font-bold'
                    : isDark
                    ? 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{preset.icon}</span>
                  <div>
                    <div className="text-xs font-bold">{preset.label}</div>
                    <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {preset.recommendedLocation}
                    </div>
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-emerald-500 stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Scan Real Item Barcode OR Show Printable Station Card */}
      <div className="pt-1 space-y-2">
        <span className={`text-xs block font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          2. تسجيل باركود غرض حقيقي في منزلك أو طباعة بطاقة الوضوء:
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setIsScannerOpen(!isScannerOpen);
              setShowPrintableCard(false);
            }}
            className={`py-2.5 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
              isScannerOpen
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                : isDark
                ? 'bg-slate-900 hover:bg-slate-800 border-emerald-500/40 text-emerald-300'
                : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-900'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>{isScannerOpen ? 'إغلاق ماسح التسجيل' : 'مسح باركود غرض حقيقي الآن'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowPrintableCard(!showPrintableCard);
              setIsScannerOpen(false);
            }}
            className={`py-2.5 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
              showPrintableCard
                ? 'bg-teal-600 text-white border-teal-500 shadow-md'
                : isDark
                ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>بطاقة باركود للطباعة / اللصق</span>
          </button>
        </div>

        {/* Live Camera Registration Box */}
        {isScannerOpen && (
          <div
            className={`mt-3 p-3 rounded-2xl border ${
              isDark ? 'bg-slate-950 border-emerald-700/50' : 'bg-white border-emerald-300 shadow-md'
            }`}
          >
            <BarcodeMissionScanner
              expectedCode={barcodeValue}
              expectedLabel={barcodeLabel}
              isSetupMode={true}
              onCodeScannedInSetup={(scannedCode, label) => {
                onChangeBarcode(scannedCode, label);
                setIsScannerOpen(false);
              }}
              onCompleted={() => setIsScannerOpen(false)}
              onCancelSetupScan={() => setIsScannerOpen(false)}
            />
          </div>
        )}

        {/* Printable / Screenshotable Wudu Station Card */}
        {showPrintableCard && (
          <div className="mt-3 p-5 rounded-2xl bg-white text-slate-900 border-2 border-dashed border-emerald-600 text-center space-y-3 shadow-lg">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>ملصق محطة استيقاظ الفجر — صوّره أو اطبعه وعلّقه عند مكان الوضوء</span>
            </div>

            <div className="text-base font-extrabold text-slate-900">{barcodeLabel}</div>

            {/* High-Contrast Visual Barcode Bars */}
            <div className="py-3 px-6 bg-white border border-slate-300 rounded-xl inline-flex flex-col items-center mx-auto">
              <div className="flex items-center justify-center gap-0.5 h-16">
                {Array.from({ length: 34 }).map((_, idx) => {
                  const charCode = barcodeValue.charCodeAt(idx % barcodeValue.length) || 65;
                  const widthClass =
                    (charCode + idx) % 3 === 0
                      ? 'w-1.5'
                      : (charCode + idx) % 2 === 0
                      ? 'w-1'
                      : 'w-0.5';
                  return (
                    <div
                      key={idx}
                      className={`h-full bg-black ${widthClass} ${
                        idx % 5 === 0 ? 'ml-1' : ''
                      }`}
                    />
                  );
                })}
              </div>
              <div className="font-mono text-sm font-black tracking-widest text-slate-900 mt-2 dir-ltr">
                {barcodeValue}
              </div>
            </div>

            <p className="text-[11px] text-slate-600 max-w-xs mx-auto leading-relaxed">
              «بَشِّرِ الْمَشَّائِينَ فِي الظُّلَمِ إِلَى الْمَسَاجِدِ بِالنُّورِ التَّامِّ يَوْمَ الْقِيَامَةِ»
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
