import 'dart:async';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../constants/app_colors.dart';
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

  String _formatDuration(Duration d) {
    final hours = d.inHours.toString().padLeft(2, '0');
    final minutes = (d.inMinutes % 60).toString().padLeft(2, '0');
    final seconds = (d.inSeconds % 60).toString().padLeft(2, '0');
    return '$hours:$minutes:$seconds';
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator(color: AppColors.emerald)),
      );
    }

    final activeTone = kAlarmTones.firstWhere(
      (t) => t.id == _config.selectedToneId,
      orElse: () => kAlarmTones[0],
    );

    final timeFormatter = DateFormat('hh:mm a', 'ar');

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
              // بطاقة العداد التنازلي لوقت الفجر
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Colors.teal.shade900, const Color(0xFF0F172A)],
                    begin: Alignment.topRight,
                    end: Alignment.bottomLeft,
                  ),
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.emerald.withOpacity(0.15),
                      blurRadius: 16,
                      spreadRadius: 2,
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.location_on, color: AppColors.emerald, size: 18),
                            const SizedBox(width: 4),
                            Text(
                              _config.city,
                              style: const TextStyle(color: Colors.white70, fontSize: 13),
                            ),
                          ],
                        ),
                        Switch(
                          value: _config.isEnabled,
                          activeColor: AppColors.emerald,
                          onChanged: _toggleAlarm,
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    const Text(
                      'الوقت المتبقي للاستيقاظ',
                      style: TextStyle(color: Colors.white60, fontSize: 14),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      _config.isEnabled ? _formatDuration(_timeUntilFajr) : '--:--:--',
                      style: const TextStyle(
                        fontSize: 42,
                        fontWeight: FontWeight.w900,
                        fontFamily: 'monospace',
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 14),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                        color: Colors.white10,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.mosque, color: Colors.amber, size: 18),
                          const SizedBox(width: 8),
                          Text(
                            'أذان الفجر: ${timeFormatter.format(_nextFajrDate)}',
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(width: 12),
                          Text(
                            '(المنبه: ${timeFormatter.format(_nextWakeUpDate)})',
                            style: const TextStyle(color: AppColors.emeraldAccent, fontSize: 12),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // بطاقة النغمة المختارة
              Card(
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.emerald.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: Text(activeTone.icon, style: const TextStyle(fontSize: 26)),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('صوت المنبه الحالي', style: TextStyle(fontSize: 12, color: Colors.grey)),
                            Text(
                              activeTone.title,
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            Text(
                              activeTone.durationLabel,
                              style: const TextStyle(fontSize: 11, color: AppColors.emerald),
                            ),
                          ],
                        ),
                      ),
                      OutlinedButton(
                        style: OutlinedButton.styleFrom(
                          foregroundColor: AppColors.emerald,
                          side: const BorderSide(color: AppColors.emerald),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        onPressed: _openSetup,
                        child: const Text('تغيير'),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 12),

              // زر تجربة شاشة الرنين والمهمة فوراً
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.emerald.shade700,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                icon: const Icon(Icons.play_arrow),
                label: const Text(
                  'اختبار رنين المنبه والمهمة الآن',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
                onPressed: _startTestAlarm,
              ),

              const SizedBox(height: 10),

              // زر تعديل كافة الإعدادات
              OutlinedButton.icon(
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                icon: const Icon(Icons.edit_calendar),
                label: const Text('تعديل وقت الاستيقاظ والمهمة'),
                onPressed: _openSetup,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
