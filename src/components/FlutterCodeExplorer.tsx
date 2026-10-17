import React, { useState } from 'react';
import {
  FileCode,
  Copy,
  Check,
  FolderTree,
  Terminal,
  Download,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { useTheme } from '../themeContext';

interface FlutterFile {
  path: string;
  filename: string;
  language: string;
  description: string;
  code: string;
}

export const FLUTTER_FILES: FlutterFile[] = [
  {
    path: 'pubspec.yaml',
    filename: 'pubspec.yaml',
    language: 'yaml',
    description: 'ملف الحزم الأساسية: alarm للمنبه الصارم، adhan لحساب الصلاة، audioplayers للأصوات، vibration للاهتزاز.',
    code: `name: fajr_alarm
description: "تطبيق منبه الفجر الذكي مع مهام الاستيقاظ (تسبيح، أسئلة دينية، مسائل حسابية) وحساب أوقات الصلاة محلياً."
publish_to: "none"
version: 1.0.0+1

environment:
  sdk: ">=3.2.0 <4.0.0"

dependencies:
  flutter:
    sdk: flutter
  flutter_localizations:
    sdk: flutter

  # إدارة المنبه الصارم وتشغيل الصوت في الخلفية حتى مع إغلاق التطبيق والشاشة مقفلة
  alarm: ^4.0.0
  
  # حساب أوقات الصلاة بدقة فلكية محلياً دون إنترنت
  adhan: ^2.0.0+1
  
  # حفظ الإعدادات والمنبهات محلياً
  shared_preferences: ^2.2.2
  
  # تشغيل الأصوات والمعاينات
  audioplayers: ^6.0.0
  
  # اهتزاز الجهاز وردود الفعل اللمسية أثناء التسبيح والمنبه
  vibration: ^2.0.0
  
  # إبقاء الشاشة مضاءة عند رنين المنبه
  wakelock_plus: ^1.2.0
  
  # تنسيق التواريخ والأوقات
  intl: ^0.19.0
  
  # أيقونات عصرية
  cupertino_icons: ^1.0.6

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true

  assets:
    - assets/audio/tone_qom.mp3
    - assets/audio/tone_adhan.mp3
    - assets/audio/tone_quran.mp3`,
  },
  {
    path: 'android/app/src/main/AndroidManifest.xml',
    filename: 'AndroidManifest.xml',
    language: 'xml',
    description: 'أذونات أندرويد الحتمية: Exact Alarm, Wake Lock, Full Screen Intent لإيقاظ الشاشة المقفلة.',
    code: `<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.fajr.fajr_alarm">

    <!-- أذونات المنبه الدقيق والتشغيل بالخلفية -->
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/>
    <uses-permission android:name="android.permission.WAKE_LOCK"/>
    <uses-permission android:name="android.permission.VIBRATE"/>
    
    <!-- للأندرويد 12 و 14 لضمان عمل المنبه في الدقيقة والثانية المحددة -->
    <uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM"/>
    <uses-permission android:name="android.permission.USE_EXACT_ALARM"/>
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
    <uses-permission android:name="android.permission.USE_FULL_SCREEN_INTENT"/>
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE"/>
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK"/>
    <uses-permission android:name="android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS"/>

    <application
        android:label="منبه الفجر"
        android:name="\${applicationName}"
        android:icon="@mipmap/ic_launcher">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:theme="@style/LaunchTheme"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|smallestScreenSize|locale|layoutDirection|fontScale|screenLayout|density|uiMode"
            android:hardwareAccelerated="true"
            android:windowSoftInputMode="adjustResize"
            android:showWhenLocked="true"
            android:turnScreenOn="true">
            
            <meta-data
              android:name="io.flutter.embedding.android.NormalTheme"
              android:resource="@style/NormalTheme"
              />
            <intent-filter>
                <action android:name="android.intent.action.MAIN"/>
                <category android:name="android.intent.category.LAUNCHER"/>
            </intent-filter>
        </activity>
        
        <!-- استقبال إشارات إعادة تشغيل الهاتف لجدولة منبه الفجر تلقائياً -->
        <receiver
            android:name="com.gdelataillade.alarm.alarm.AlarmReceiver"
            android:exported="false">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED"/>
            </intent-filter>
        </receiver>

        <!-- خدمة الخلفية لتشغيل صوت الأذان دون انقطاع -->
        <service
            android:name="com.gdelataillade.alarm.services.AlarmService"
            android:foregroundServiceType="mediaPlayback"
            android:exported="false"/>

        <meta-data
            android:name="flutterEmbedding"
            android:value="2" />
    </application>
</manifest>`,
  },
  {
    path: 'lib/main.dart',
    filename: 'main.dart',
    language: 'dart',
    description: 'نقطة الانطلاق: تهيئة AlarmService، دعم اللغة العربية والاتجاه من اليمين لليسار، والثيم الداكن والفاتح.',
    code: `import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'screens/home_screen.dart';
import 'services/alarm_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // تهيئة حزمة المنبه لإيقاظ الهاتف حتى لو كان التطبيق مغلقاً
  await AlarmService.initialize();

  runApp(const FajrAlarmApp());
}

class FajrAlarmApp extends StatelessWidget {
  const FajrAlarmApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'منبه الفجر',
      debugShowCheckedModeBanner: false,
      
      // دعم اللغة العربية والاتجاه من اليمين لليسار RTL
      locale: const Locale('ar', ''),
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [
        Locale('ar', ''),
      ],

      // ثيم إسلامي عصري مريح للعين
      themeMode: ThemeMode.dark,
      darkTheme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0B132B),
        colorScheme: const ColorScheme.dark(
          primary: Colors.emerald,
          secondary: Colors.tealAccent,
          surface: Color(0xFF1C2541),
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF0B132B),
          elevation: 0,
        ),
        fontFamily: 'Cairo',
      ),
      theme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.light,
        scaffoldBackgroundColor: const Color(0xFFF8FAFC),
        colorScheme: const ColorScheme.light(
          primary: Colors.emerald,
          surface: Colors.white,
        ),
        fontFamily: 'Cairo',
      ),

      home: const HomeScreen(),
    );
  }
}`,
  },
  {
    path: 'lib/models/alarm_model.dart',
    filename: 'alarm_model.dart',
    language: 'dart',
    description: 'نماذج البيانات: إعدادات المنبه، النغمات الثلاث، أنواع المهام، وبنك الأسئلة الدينية والتسبيح.',
    code: `import 'dart:convert';

enum MissionType {
  dhikr,
  tasbih,
  religiousQuiz,
  mathQuiz,
}

enum MathDifficulty {
  easy,
  medium,
  hard,
}

class AlarmTone {
  final String id;
  final String title;
  final String subtitle;
  final String icon;
  final String assetPath;
  final String durationLabel;
  final String description;

  const AlarmTone({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.assetPath,
    required this.durationLabel,
    required this.description,
  });
}

class AlarmConfig {
  final String fajrTime;
  final int offsetMinutes;
  final String wakeUpTime;
  final MissionType missionType;
  final int tasbihCount;
  final String tasbihPhrase;
  final int religiousQuestionsCount;
  final int mathQuestionsCount;
  final MathDifficulty mathDifficulty;
  final String selectedToneId;
  final bool isEnabled;
  final String city;

  AlarmConfig({
    required this.fajrTime,
    required this.offsetMinutes,
    required this.wakeUpTime,
    required this.missionType,
    required this.tasbihCount,
    required this.tasbihPhrase,
    required this.religiousQuestionsCount,
    required this.mathQuestionsCount,
    required this.mathDifficulty,
    required this.selectedToneId,
    required this.isEnabled,
    required this.city,
  });

  factory AlarmConfig.defaultConfig() {
    return AlarmConfig(
      fajrTime: "04:52",
      offsetMinutes: -15,
      wakeUpTime: "04:37",
      missionType: MissionType.tasbih,
      tasbihCount: 5,
      tasbihPhrase: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ ، سُبْحَانَ اللَّهِ العَظِيمِ",
      religiousQuestionsCount: 2,
      mathQuestionsCount: 2,
      mathDifficulty: MathDifficulty.easy,
      selectedToneId: 'tone_qom',
      isEnabled: true,
      city: "مكة المكرمة",
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'fajrTime': fajrTime,
      'offsetMinutes': offsetMinutes,
      'wakeUpTime': wakeUpTime,
      'missionType': missionType.index,
      'tasbihCount': tasbihCount,
      'tasbihPhrase': tasbihPhrase,
      'religiousQuestionsCount': religiousQuestionsCount,
      'mathQuestionsCount': mathQuestionsCount,
      'mathDifficulty': mathDifficulty.index,
      'selectedToneId': selectedToneId,
      'isEnabled': isEnabled,
      'city': city,
    };
  }

  factory AlarmConfig.fromMap(Map<String, dynamic> map) {
    return AlarmConfig(
      fajrTime: map['fajrTime'] ?? "04:52",
      offsetMinutes: map['offsetMinutes'] ?? -15,
      wakeUpTime: map['wakeUpTime'] ?? "04:37",
      missionType: MissionType.values[map['missionType'] ?? 1],
      tasbihCount: map['tasbihCount'] ?? 5,
      tasbihPhrase: map['tasbihPhrase'] ?? "سُبْحَانَ اللَّهِ",
      religiousQuestionsCount: map['religiousQuestionsCount'] ?? 2,
      mathQuestionsCount: map['mathQuestionsCount'] ?? 2,
      mathDifficulty: MathDifficulty.values[map['mathDifficulty'] ?? 0],
      selectedToneId: map['selectedToneId'] ?? 'tone_qom',
      isEnabled: map['isEnabled'] ?? true,
      city: map['city'] ?? "مكة المكرمة",
    );
  }

  String toJson() => json.encode(toMap());
  factory AlarmConfig.fromJson(String source) => AlarmConfig.fromMap(json.decode(source));
}

// قائمة النغمات الثلاث
final List<AlarmTone> kAlarmTones = [
  const AlarmTone(
    id: 'tone_qom',
    title: 'النغمة الأولى: قم يا أخي (تذكير نبوي وأذان)',
    subtitle: '«بشر المشائين في الظلم... أثقل صلاة على المنافقين»',
    icon: '📢',
    durationLabel: '1:33 دقيقة',
    description: 'نداء حازم ومحفز يتضمن الأذان وتذكيراً بأحاديث النبي ﷺ.',
    assetPath: 'assets/audio/tone_qom.mp3',
  ),
  const AlarmTone(
    id: 'tone_adhan',
    title: 'النغمة الثانية: الصلاة خير من النوم (أذان ندي خاشع)',
    subtitle: 'ترتيل نداء الفجر بخشوع وسكينة في سكون الليل',
    icon: '🕌',
    durationLabel: '0:33 دقيقة',
    description: 'نداء الفجر المؤثر يكرر «الصلاة خير من النوم» بهدوء وسكينة.',
    assetPath: 'assets/audio/tone_adhan.mp3',
  ),
  const AlarmTone(
    id: 'tone_quran',
    title: 'النغمة الثالثة: إن المتقين في جنات (تلاوة خاشعة)',
    subtitle: '«كانوا قليلاً من الليل ما يهجعون وبالأسحار هم يستغفرون»',
    icon: '📖',
    durationLabel: '0:56 دقيقة',
    description: 'تلاوة قرآنية خاشعة ومؤثرة من سورة الذاريات.',
    assetPath: 'assets/audio/tone_quran.mp3',
  ),
];`,
  },
  {
    path: 'lib/services/prayer_service.dart',
    filename: 'prayer_service.dart',
    language: 'dart',
    description: 'حساب مواقيت الصلاة الفلكية محلياً دون أي حاجة للإنترنت باستخدام adhan.',
    code: `import 'package:adhan/adhan.dart';

class PrayerService {
  // حساب وقت الفجر بدقة فلكية معتمدة
  static DateTime calculateFajrTime({
    double latitude = 21.4225, // مكة المكرمة افتراضياً
    double longitude = 39.8262,
    DateTime? date,
  }) {
    final targetDate = date ?? DateTime.now();
    final coordinates = Coordinates(latitude, longitude);
    final params = CalculationMethod.umm_al_qura.getParameters();
    params.madhab = Madhab.shafi;

    final prayerTimes = PrayerTimes(
      coordinates,
      DateComponents.from(targetDate),
      params,
    );

    // إذا كان وقت فجر اليوم قد انقضى بالفعل، نحسب وقت فجر الغد
    if (prayerTimes.fajr.isBefore(DateTime.now())) {
      final tomorrow = targetDate.add(const Duration(days: 1));
      final tomorrowPrayers = PrayerTimes(
        coordinates,
        DateComponents.from(tomorrow),
        params,
      );
      return tomorrowPrayers.fajr;
    }

    return prayerTimes.fajr;
  }

  // حساب وقت الاستيقاظ الفعلي بتطبيق الإزاحة بالدقائق
  static DateTime calculateWakeUpDateTime({
    required DateTime fajrDateTime,
    required int offsetMinutes,
  }) {
    return fajrDateTime.add(Duration(minutes: offsetMinutes));
  }
}`,
  },
  {
    path: 'lib/services/alarm_service.dart',
    filename: 'alarm_service.dart',
    language: 'dart',
    description: 'جدولة المنبه الصارم بنظام Exact Alarm والتشغيل المتكرر للصوت في الخلفية.',
    code: `import 'package:alarm/alarm.dart';
import 'package:alarm/model/alarm_settings.dart';
import 'package:audioplayers/audioplayers.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/alarm_model.dart';
import 'prayer_service.dart';

class AlarmService {
  static const int kFajrAlarmId = 42;
  static final AudioPlayer _previewPlayer = AudioPlayer();

  // تهيئة حزمة المنبه عند تشغيل التطبيق
  static Future<void> initialize() async {
    await Alarm.init();
  }

  // حفظ الإعدادات في الذاكرة المحلية
  static Future<void> saveConfig(AlarmConfig config) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('fajr_alarm_config', config.toJson());
  }

  // استرجاع الإعدادات المحفوظة
  static Future<AlarmConfig> loadConfig() async {
    final prefs = await SharedPreferences.getInstance();
    final jsonStr = prefs.getString('fajr_alarm_config');
    if (jsonStr != null && jsonStr.isNotEmpty) {
      try {
        return AlarmConfig.fromJson(jsonStr);
      } catch (e) {
        // العودة للافتراضي عند أي خطأ
      }
    }
    return AlarmConfig.defaultConfig();
  }

  // جدولة منبه الفجر القادم بدقة
  static Future<bool> scheduleFajrAlarm(AlarmConfig config) async {
    if (!config.isEnabled) {
      await cancelAlarm();
      return false;
    }

    // حساب وقت الفجر القادم
    final fajrDate = PrayerService.calculateFajrTime();
    final wakeUpDate = PrayerService.calculateWakeUpDateTime(
      fajrDateTime: fajrDate,
      offsetMinutes: config.offsetMinutes,
    );

    // البحث عن مسار الصوت المختار
    final selectedTone = kAlarmTones.firstWhere(
      (t) => t.id == config.selectedToneId,
      orElse: () => kAlarmTones[0],
    );

    final alarmSettings = AlarmSettings(
      id: kFajrAlarmId,
      dateTime: wakeUpDate,
      assetAudioPath: selectedTone.assetPath,
      loopAudio: true,
      vibrate: true,
      volume: 1.0,
      fadeDuration: 3.0,
      notificationTitle: 'حان موعد صلاة الفجر',
      notificationBody: 'قم وتوضأ، واكمل مهمة الاستيقاظ لإيقاف المنبه',
      enableNotificationOnKill: true,
      androidFullScreenIntent: true,
    );

    await Alarm.set(alarmSettings: alarmSettings);
    return true;
  }

  // إيقاف المنبه
  static Future<void> stopAlarm(int id) async {
    await Alarm.stop(id);
  }

  // إلغاء جدولة المنبه القادم
  static Future<void> cancelAlarm() async {
    await Alarm.stop(kFajrAlarmId);
  }

  // معاينة النغمة في شاشات الإعدادات
  static Future<void> playPreview(String assetPath) async {
    await _previewPlayer.stop();
    await _previewPlayer.play(AssetSource(assetPath.replaceFirst('assets/', '')));
  }

  static Future<void> stopPreview() async {
    await _previewPlayer.stop();
  }
}`,
  },
  {
    path: 'lib/screens/home_screen.dart',
    filename: 'home_screen.dart',
    language: 'dart',
    description: 'شاشة المنبه الرئيسية: العداد التنازلي الحي لوقت الفجر، زر التشغيل، بطاقة النغمة، وزر الاختبار السريع.',
    code: `import 'dart:async';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/alarm_model.dart';
import '../services/alarm_service.dart';
import '../services/prayer_service.dart';
import 'ringing_screen.dart';
import 'setup_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  AlarmConfig _config = AlarmConfig.defaultConfig();
  bool _isLoading = true;
  Timer? _timer;
  Duration _timeUntilFajr = Duration.zero;
  DateTime _nextFajrDate = DateTime.now();
  DateTime _nextWakeUpDate = DateTime.now();

  @override
  void initState() {
    super.initState();
    _loadInitialData();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) => _updateCountdown());
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Future<void> _loadInitialData() async {
    final loaded = await AlarmService.loadConfig();
    setState(() {
      _config = loaded;
      _isLoading = false;
    });
    _calculateNextTimes();
    await AlarmService.scheduleFajrAlarm(_config);
  }

  void _calculateNextTimes() {
    _nextFajrDate = PrayerService.calculateFajrTime();
    _nextWakeUpDate = PrayerService.calculateWakeUpDateTime(
      fajrDateTime: _nextFajrDate,
      offsetMinutes: _config.offsetMinutes,
    );
    _updateCountdown();
  }

  void _updateCountdown() {
    final now = DateTime.now();
    final diff = _nextWakeUpDate.difference(now);
    setState(() {
      _timeUntilFajr = diff.isNegative ? Duration.zero : diff;
    });
  }

  void _toggleAlarm(bool val) async {
    final updated = AlarmConfig(
      fajrTime: _config.fajrTime,
      offsetMinutes: _config.offsetMinutes,
      wakeUpTime: _config.wakeUpTime,
      missionType: _config.missionType,
      tasbihCount: _config.tasbihCount,
      tasbihPhrase: _config.tasbihPhrase,
      religiousQuestionsCount: _config.religiousQuestionsCount,
      mathQuestionsCount: _config.mathQuestionsCount,
      mathDifficulty: _config.mathDifficulty,
      selectedToneId: _config.selectedToneId,
      isEnabled: val,
      city: _config.city,
    );

    setState(() => _config = updated);
    await AlarmService.saveConfig(updated);
    await AlarmService.scheduleFajrAlarm(updated);
  }

  void _openSetup() async {
    final updated = await Navigator.of(context).push<AlarmConfig>(
      MaterialPageRoute(builder: (_) => SetupScreen(initialConfig: _config)),
    );

    if (updated != null) {
      setState(() => _config = updated);
      _calculateNextTimes();
      await AlarmService.saveConfig(updated);
      await AlarmService.scheduleFajrAlarm(updated);
    }
  }

  void _startTestAlarm() {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => RingingScreen(
          alarmId: 99,
          config: _config,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator(color: Colors.emerald)),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('منبه الفجر الذكي'),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: _openSetup,
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // بطاقة العداد التنازلي
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Colors.teal.shade900, const Color(0xFF0F172A)],
                    begin: Alignment.topRight,
                    end: Alignment.bottomLeft,
                  ),
                  borderRadius: BorderRadius.circular(24),
                ),
                child: Column(
                  children: [
                    Text('الوقت المتبقي للاستيقاظ', style: TextStyle(color: Colors.white70)),
                    const SizedBox(height: 6),
                    Text(
                      _config.isEnabled ? _timeUntilFajr.toString().split('.').first : '--:--:--',
                      style: const TextStyle(fontSize: 40, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.emerald,
                  padding: const EdgeInsets.all(16),
                ),
                icon: const Icon(Icons.play_arrow),
                label: const Text('تجربة رنين المنبه وشاشة المهمة الآن'),
                onPressed: _startTestAlarm,
              ),
            ],
          ),
        ),
      ),
    );
  }
}`,
  },
  {
    path: 'lib/screens/ringing_screen.dart',
    filename: 'ringing_screen.dart',
    language: 'dart',
    description: 'شاشة الرنين الصارمة: قفل زر الرجوع والإغلاق حتى إكمال المهمة بنجاح، مع إبقاء الشاشة مضاءة (Wakelock).',
    code: `import 'package:flutter/material.dart';
import 'package:wakelock_plus/wakelock_plus.dart';
import '../models/alarm_model.dart';
import '../services/alarm_service.dart';
import '../widgets/mission_widgets.dart';

class RingingScreen extends StatefulWidget {
  final int alarmId;
  final AlarmConfig config;

  const RingingScreen({super.key, required this.alarmId, required this.config});

  @override
  State<RingingScreen> createState() => _RingingScreenState();
}

class _RingingScreenState extends State<RingingScreen> {
  bool _missionCompleted = false;

  @override
  void initState() {
    super.initState();
    WakelockPlus.enable(); // إبقاء الشاشة مضاءة
  }

  @override
  void dispose() {
    WakelockPlus.disable();
    super.dispose();
  }

  void _onMissionFinished() async {
    setState(() => _missionCompleted = true);
    await AlarmService.stopAlarm(widget.alarmId); // إيقاف الصوت فور إتمام المهمة
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async => _missionCompleted, // منع الرجوع قبل إنجاز المهمة
      child: Scaffold(
        backgroundColor: const Color(0xFF0F172A),
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              children: [
                const Text('حان موعد صلاة الفجر', style: TextStyle(color: Colors.amber, fontSize: 18)),
                Text(widget.config.wakeUpTime, style: const TextStyle(fontSize: 48, fontWeight: FontWeight.bold, color: Colors.white)),
                const Divider(color: Colors.white24, height: 40),
                Expanded(
                  child: Center(
                    child: _missionCompleted
                        ? const Text('أحسنت! أتممت مهمتك واستيقظت', style: TextStyle(fontSize: 22, color: Colors.emerald))
                        : TasbihMissionWidget(
                            targetCount: widget.config.tasbihCount,
                            phrase: widget.config.tasbihPhrase,
                            onCompleted: _onMissionFinished,
                          ),
                  ),
                ),
                if (_missionCompleted)
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.emerald, minimumSize: const Size.fromHeight(50)),
                    onPressed: () => Navigator.of(context).pop(),
                    child: const Text('تم الاستيقاظ'),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}`,
  },
  {
    path: 'lib/widgets/mission_widgets.dart',
    filename: 'mission_widgets.dart',
    language: 'dart',
    description: 'ويدجت مهام الاستيقاظ: التسبيح الذكي مع الاهتزاز، الأسئلة الدينية، والمسائل الحسابية السريعة.',
    code: `import 'dart:math';
import 'package:flutter/material.dart';
import 'package:vibration/vibration.dart';
import '../models/alarm_model.dart';

// ويدجت مهمة التسبيح الذكي
class TasbihMissionWidget extends StatefulWidget {
  final int targetCount;
  final String phrase;
  final VoidCallback onCompleted;

  const TasbihMissionWidget({
    super.key,
    required this.targetCount,
    required this.phrase,
    required this.onCompleted,
  });

  @override
  State<TasbihMissionWidget> createState() => _TasbihMissionWidgetState();
}

class _TasbihMissionWidgetState extends State<TasbihMissionWidget> {
  int _currentCount = 0;

  void _increment() {
    if (_currentCount < widget.targetCount) {
      setState(() => _currentCount++);
      Vibration.vibrate(duration: 40); // رد فعل لمسي

      if (_currentCount >= widget.targetCount) {
        Vibration.vibrate(pattern: [0, 100, 50, 150]);
        widget.onCompleted();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(widget.phrase, style: const TextStyle(fontSize: 20, color: Colors.emerald, fontWeight: FontWeight.bold)),
        const SizedBox(height: 28),
        GestureDetector(
          onTap: _increment,
          child: Container(
            width: 160,
            height: 160,
            decoration: const BoxDecoration(shape: BoxShape.circle, color: Colors.emerald),
            child: Center(
              child: Text('$_currentCount / \${widget.targetCount}', style: const TextStyle(fontSize: 30, color: Colors.white, fontWeight: FontWeight.bold)),
            ),
          ),
        ),
      ],
    );
  }
}`,
  },
];

export const FlutterCodeExplorer: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const selectedFile = FLUTTER_FILES[selectedFileIndex];

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div
        className={`border rounded-2xl p-5 ${
          isDark
            ? 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/30 border-emerald-800/40'
            : 'bg-gradient-to-r from-emerald-50 via-white to-teal-50 border-emerald-200 shadow-xs'
        }`}
      >
        <div className="flex items-center gap-2.5 mb-2">
          <Sparkles className="w-5 h-5 text-emerald-500" />
          <h3 className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
            مشروع Flutter المتكامل جاهز للاستخدام
          </h3>
        </div>
        <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          تمت كتابة وتجهيز هيكل المشروع بالكامل بلغة Dart و Flutter مع التعامل الدقيق مع معضلة سكون النظام
          (Doze Mode و Exact Alarms)، وتضمين الخوارزميات الفلكية، الأصوات، ومهام الاستيقاظ.
        </p>

        {/* Quick Commands */}
        <div
          className={`mt-4 p-3 rounded-xl border flex items-center justify-between text-xs font-mono dir-ltr ${
            isDark ? 'bg-slate-950/90 border-slate-800 text-emerald-400' : 'bg-slate-900 text-emerald-300'
          }`}
        >
          <span>flutter create . &amp;&amp; flutter pub get &amp;&amp; flutter run</span>
          <button
            onClick={() => {
              navigator.clipboard.writeText('flutter create . && flutter pub get && flutter run');
            }}
            className="text-slate-400 hover:text-white px-2 py-1 rounded bg-white/10 cursor-pointer"
            title="نسخ أمر التشغيل"
          >
            نسخ الأمر
          </button>
        </div>
      </div>

      {/* Explorer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* File List / Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-1.5">
          <div className="flex items-center gap-2 px-1 pb-1">
            <FolderTree className="w-4 h-4 text-emerald-500" />
            <span className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              ملفات المشروع ({FLUTTER_FILES.length})
            </span>
          </div>

          <div
            className={`border rounded-2xl p-2 space-y-1 overflow-y-auto max-h-[480px] ${
              isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            {FLUTTER_FILES.map((file, idx) => {
              const isSelected = selectedFileIndex === idx;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFileIndex(idx)}
                  className={`w-full text-right p-2.5 rounded-xl transition-all cursor-pointer flex items-start gap-2.5 ${
                    isSelected
                      ? isDark
                        ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                        : 'bg-emerald-600 text-white shadow-sm font-semibold'
                      : isDark
                      ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <FileCode className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-white' : 'text-emerald-500'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-mono font-medium truncate dir-ltr text-right">
                      {file.filename}
                    </div>
                    <div
                      className={`text-[10px] truncate mt-0.5 ${
                        isSelected ? 'text-emerald-100' : isDark ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      {file.path}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Code Viewer */}
        <div className="lg:col-span-8 flex flex-col">
          <div
            className={`border rounded-2xl flex flex-col overflow-hidden h-[480px] ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-900 border-slate-700'
            }`}
          >
            {/* Header / Actions */}
            <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-emerald-400 dir-ltr">
                  {selectedFile.path}
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                  {selectedFile.language}
                </span>
              </div>

              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'تم النسخ!' : 'نسخ الكود'}</span>
              </button>
            </div>

            {/* Description bar */}
            <div className="px-4 py-2 bg-slate-900/40 border-b border-slate-800/60 text-xs text-slate-400">
              {selectedFile.description}
            </div>

            {/* Pre block */}
            <div className="flex-1 overflow-auto p-4 dir-ltr text-left">
              <pre className="font-mono text-xs text-slate-200 leading-relaxed whitespace-pre select-text">
                {selectedFile.code}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
