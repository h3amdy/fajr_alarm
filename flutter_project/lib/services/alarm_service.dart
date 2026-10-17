import 'package:alarm/alarm.dart';
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
      notificationSettings: const NotificationSettings(
        title: 'حان موعد صلاة الفجر',
        body: 'قم وتوضأ، واكمل مهمة الاستيقاظ لإيقاف المنبه',
      ),
      warningNotificationOnKill: true,
      androidFullScreenIntent: true,
    );

    await Alarm.set(alarmSettings: alarmSettings);
    return true;
  }

  // جدولة منبه تجريبي سريع (بعد 5 ثوانٍ) لاختبار المهام والأصوات
  static Future<void> scheduleTestAlarm(AlarmConfig config) async {
    final selectedTone = kAlarmTones.firstWhere(
      (t) => t.id == config.selectedToneId,
      orElse: () => kAlarmTones[0],
    );

    final testSettings = AlarmSettings(
      id: 99,
      dateTime: DateTime.now().add(const Duration(seconds: 5)),
      assetAudioPath: selectedTone.assetPath,
      loopAudio: true,
      vibrate: true,
      volume: 1.0,
      notificationSettings: const NotificationSettings(
        title: 'تجربة منبه الفجر',
        body: 'أكمل المهمة لإيقاف المنبه التجريبي',
      ),
      androidFullScreenIntent: true,
    );

    await Alarm.set(alarmSettings: testSettings);
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
}
