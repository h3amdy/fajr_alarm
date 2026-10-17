import React, { useState } from 'react';
import {
  Code,
  ShieldAlert,
  BellRing,
  Cpu,
  Clock,
  BatteryCharging,
  Smartphone,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  FileCode,
  BookOpen,
} from 'lucide-react';
import { useTheme } from '../themeContext';
import { FlutterCodeExplorer } from './FlutterCodeExplorer';

export const FlutterTechSpec: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [viewMode, setViewMode] = useState<'code' | 'architecture'>('code');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<number | null>(1);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const sections = [
    {
      id: 1,
      title: '1. معضلة المنبه في أنظمة الهواتف (The Background Execution Dilemma)',
      icon: <BatteryCharging className="w-5 h-5 text-amber-500" />,
      content: (
        <div className={`space-y-4 text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          <p>
            تطوير منبه الفجر هو أحد أكثر التحديات التقنية تعقيداً في تطبيقات الجوال لسبب رئيسي:
            <strong className={isDark ? 'text-white' : 'text-slate-900'}>
              {' '}أنظمة أندرويد و iOS مصممة أصلاً لقتل أي تطبيق يعمل في الخلفية لتوفير البطارية
            </strong>{' '}
            (Doze Mode و App Standby).
          </p>

          <div
            className={`border rounded-2xl p-4 ${
              isDark
                ? 'bg-rose-950/40 border-rose-800/50'
                : 'bg-rose-50 border-rose-200'
            }`}
          >
            <div
              className={`font-bold mb-2 flex items-center gap-2 ${
                isDark ? 'text-rose-300' : 'text-rose-800'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              لماذا تفشل الحلول العادية (مثل Timers أو flutter_local_notifications العادية)؟
            </div>
            <ul
              className={`list-disc list-inside space-y-1 text-xs sm:text-sm ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}
            >
              <li>
                <code className={`font-mono px-1 rounded ${isDark ? 'text-rose-200 bg-rose-950/80' : 'text-rose-700 bg-rose-100'}`}>
                  Timer.periodic
                </code>{' '}
                أو{' '}
                <code className={`font-mono px-1 rounded ${isDark ? 'text-rose-200 bg-rose-950/80' : 'text-rose-700 bg-rose-100'}`}>
                  Future.delayed
                </code>{' '}
                تموت تماماً بمجرد إغلاق التطبيق أو دخول الهاتف في سكون عميق.
              </li>
              <li>الإشعارات العادية لا تضمن الاستيقاظ في الوقت الدقيق بالثانية (Inexact Alarm) وقد تتأخر من 15 إلى 45 دقيقة!</li>
              <li>واجهات الشركات (Xiaomi HyperOS, Samsung OneUI, Huawei) تملك إدارة بطارية قسرية تغلق التطبيقات.</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      title: '2. حل أندرويد القاطع: Exact Alarm و AlarmClock',
      icon: <Clock className="w-5 h-5 text-emerald-500" />,
      content: (
        <div className={`space-y-4 text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          <p>
            في نظام Android 12+ (API 31+) و Android 14+ (API 34+)، لا يمكن إيقاظ الهاتف بدقة إلا باستخدام:
            <code
              className={`mx-1 px-2 py-0.5 rounded border font-mono text-xs ${
                isDark
                  ? 'text-emerald-300 bg-emerald-950/60 border-emerald-800/60'
                  : 'text-emerald-800 bg-emerald-50 border-emerald-200'
              }`}
            >
              AlarmManager.setAlarmClock()
            </code>
          </p>

          <div
            className={`border rounded-2xl p-4 transition-colors ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`font-mono text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                AndroidManifest.xml
              </span>
              <button
                onClick={() =>
                  copyToClipboard(
                    `<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />\n<uses-permission android:name="android.permission.USE_EXACT_ALARM" />\n<uses-permission android:name="android.permission.USE_FULL_SCREEN_INTENT" />\n<uses-permission android:name="android.permission.WAKE_LOCK" />\n<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />\n<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />\n<uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK" />\n<uses-permission android:name="android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS" />`,
                    'manifest'
                  )
                }
                className={`text-xs flex items-center gap-1 cursor-pointer transition-colors ${
                  isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {copiedKey === 'manifest' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>نسخ</span>
              </button>
            </div>
            <pre
              className={`text-xs font-mono p-3 rounded-xl overflow-x-auto dir-ltr text-left ${
                isDark
                  ? 'text-emerald-300 bg-slate-950 border border-slate-800/60'
                  : 'text-emerald-900 bg-white border border-slate-200'
              }`}
            >
{`<!-- أذونات المنبه الحتمي والشاشة المقفلة -->
<uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
<uses-permission android:name="android.permission.USE_EXACT_ALARM" />
<uses-permission android:name="android.permission.USE_FULL_SCREEN_INTENT" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK" />
<uses-permission android:name="android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS" />`}
            </pre>
          </div>

          <div
            className={`p-3 border rounded-xl text-xs ${
              isDark
                ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            💡 <strong>ملاحظة متجر Google Play:</strong> إذن <code className="font-mono">USE_EXACT_ALARM</code> مخصص حصراً لتطبيقات المنبهات والتقويم. تطبيق منبه الفجر مؤهل 100% لقبوله دون قيود عند اختيار فئة "Alarm app" في استبيان النشر.
          </div>
        </div>
      ),
    },
    {
      id: 3,
      title: '3. إيقاظ الشاشة المقفلة (Full-Screen Intent)',
      icon: <Smartphone className="w-5 h-5 text-teal-500" />,
      content: (
        <div className={`space-y-4 text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          <p>
            حين يكون الهاتف على المنضدة ومقفلاً، لا يكفي إظهار إشعار!
            يجب إيقاظ الشاشة فوراً وإظهار <strong className={isDark ? 'text-white' : 'text-slate-900'}>شاشة الرنين الخاصة بمنبه الفجر</strong> مباشرة فوق شاشة القفل.
          </p>

          <div
            className={`border rounded-2xl p-4 transition-colors ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className={`text-xs mb-2 font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              إعداد MainActivity في AndroidManifest.xml:
            </div>
            <pre
              className={`text-xs font-mono p-3 rounded-xl overflow-x-auto dir-ltr text-left ${
                isDark
                  ? 'text-teal-300 bg-slate-950 border border-slate-800/60'
                  : 'text-teal-900 bg-white border border-slate-200'
              }`}
            >
{`<activity
    android:name=".MainActivity"
    android:showWhenLocked="true"
    android:turnScreenOn="true"
    android:exported="true"
    android:launchMode="singleInstance">
</activity>`}
            </pre>
          </div>
        </div>
      ),
    },
    {
      id: 4,
      title: '4. الصوت وتخطي وضع الصامت وعدم الإزعاج (DND & Audio Stream)',
      icon: <BellRing className="w-5 h-5 text-amber-500" />,
      content: (
        <div className={`space-y-4 text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          <p>
            المنبه يجب أن يرن حتى لو كان هاتف المستخدم على <strong className={isDark ? 'text-white' : 'text-slate-900'}>«وضع الصامت»</strong> أو <strong className={isDark ? 'text-white' : 'text-slate-900'}>«عدم الإزعاج (Do Not Disturb)»</strong>.
          </p>
          <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm">
            <li>
              <strong>قناة الصوت الصحيحة:</strong> تشغيل الصوت عبر مسار <code className="font-mono text-emerald-500">STREAM_ALARM</code> (وليس STREAM_MUSIC). مسار المنبه في أندرويد يخترق وضع الصامت تلقائياً.
            </li>
            <li>
              <strong>Audio Focus:</strong> طلب تركيز صوتي بنوع <code className="font-mono text-emerald-500">AUDIOFOCUS_GAIN_TRANSIENT</code> لإيقاف أي وسائط أخرى قيد التشغيل فوراً.
            </li>
            <li>
              <strong>الارتقاء التدريجي (Crescendo):</strong> يبدأ صوت الرنين الهادئ بنعومة ويرتفع تدريجياً لتجنب فزع النائم.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 5,
      title: '5. معادلة تغير وقت الفجر يومياً والحساب دون إنترنت',
      icon: <Cpu className="w-5 h-5 text-indigo-500" />,
      content: (
        <div className={`space-y-4 text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          <p>
            وقت صلاة الفجر يتغير بمقدار دقيقة إلى دقيقتين كل يوم. لا يمكن الاعتماد على تكرار زمني ثابت (مثل رنين الساعة 5 كل يوم).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              className={`border rounded-xl p-3 ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className={`font-bold text-xs mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                حساب فلكي محلي (بدون إنترنت)
              </div>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                استخدام مكتبة <code className="text-indigo-500 font-mono">adhan_dart</code> أو خوارزمية أم القرى بحسب إحداثيات GPS المخزنة، فيعمل المنبه حتى في وضع الطيران.
              </p>
            </div>
            <div
              className={`border rounded-xl p-3 ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className={`font-bold text-xs mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                دورة الجدولة التلقائية
              </div>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                بمجرد إكمال المستخدم للمهمة الحالية، يقوم التطبيق فوراً بحساب موعد فجر اليوم التالي وجدولته في النظام.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 6,
      title: '6. الحزمة الموصى بها في Flutter (Recommended Architecture)',
      icon: <Code className="w-5 h-5 text-emerald-500" />,
      content: (
        <div className={`space-y-4 text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          <div
            className={`border rounded-2xl p-4 space-y-3 ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div className={`font-bold text-sm border-b pb-2 ${isDark ? 'text-white border-slate-800' : 'text-slate-900 border-slate-200'}`}>
              الباقات الموصى بها في pubspec.yaml:
            </div>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">1. alarm (v4+):</span>
                <span>الحزمة الأكثر استقراراً في Flutter حالياً؛ تدمج Foreground Service و AlarmClock و FullScreenIntent مدمجاً.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">2. adhan_dart:</span>
                <span>حساب أوقات الصلاة محلياً دون أي حاجة لشبكة الإنترنت.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">3. shared_preferences:</span>
                <span>لحفظ إعدادات المستخدم والمهمة المختارة.</span>
              </li>
            </ul>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 select-none">
      {/* Header */}
      <div className="text-center mb-6">
        <div
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3 border ${
            isDark
              ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-400'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>التحويل المتكامل إلى تطبيق Flutter المكتبي والجوال</span>
        </div>
        <h2 className={`text-2xl sm:text-3xl font-extrabold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          مشروع منبه الفجر بلغة Flutter (Dart)
        </h2>
        <p className={`text-sm sm:text-base max-w-xl mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          كود برمجي حقيقي جاهز للتشغيل مع حلول جذرية لمعضلة إغلاق المنبه في الخلفية والشاشة مقفلة.
        </p>
      </div>

      {/* Segmented Mode Switcher */}
      <div className="flex justify-center mb-6">
        <div
          className={`p-1 rounded-2xl border flex items-center gap-1.5 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}
        >
          <button
            onClick={() => setViewMode('code')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              viewMode === 'code'
                ? isDark
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-white text-emerald-800 shadow-sm'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>الأكواد المصدرية الجاهزة (Dart)</span>
          </button>

          <button
            onClick={() => setViewMode('architecture')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              viewMode === 'architecture'
                ? isDark
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-white text-emerald-800 shadow-sm'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>المواصفات الهندسية (Background Specs)</span>
          </button>
        </div>
      </div>

      {/* Content based on Mode */}
      {viewMode === 'code' ? (
        <FlutterCodeExplorer />
      ) : (
        /* Accordion Sections */
        <div className="flex flex-col gap-3">
          {sections.map((sec) => {
            const isExpanded = expandedSection === sec.id;
            return (
              <div
                key={sec.id}
                className={`border rounded-2xl transition-all duration-200 overflow-hidden ${
                  isExpanded
                    ? isDark
                      ? 'bg-slate-900/90 border-slate-700 shadow-xl'
                      : 'bg-white border-slate-300 shadow-md'
                    : isDark
                    ? 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setExpandedSection(isExpanded ? null : sec.id)}
                  className="w-full py-4 px-5 flex items-center justify-between text-right cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isDark ? 'bg-slate-800' : 'bg-slate-100'
                      }`}
                    >
                      {sec.icon}
                    </div>
                    <span className={`font-bold text-sm sm:text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {sec.title}
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                  ) : (
                    <ChevronDown className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                  )}
                </button>

                {isExpanded && (
                  <div
                    className={`px-5 pb-5 pt-1 border-t ${
                      isDark ? 'border-slate-800/60' : 'border-slate-100'
                    }`}
                  >
                    {sec.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

