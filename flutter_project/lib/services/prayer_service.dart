import 'package:adhan/adhan.dart';

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
}
