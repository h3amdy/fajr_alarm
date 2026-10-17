import 'package:flutter/material.dart';
import 'package:wakelock_plus/wakelock_plus.dart';
import '../models/alarm_model.dart';
import '../services/alarm_service.dart';
import '../widgets/mission_widgets.dart';

class RingingScreen extends StatefulWidget {
  final int alarmId;
  final AlarmConfig config;

  const RingingScreen({
    super.key,
    required this.alarmId,
    required this.config,
  });

  @override
  State<RingingScreen> createState() => _RingingScreenState();
}

class _RingingScreenState extends State<RingingScreen> {
  bool _missionCompleted = false;

  @override
  void initState() {
    super.initState();
    // إبقاء الشاشة مضاءة أثناء رنين المنبه
    WakelockPlus.enable();
  }

  @override
  void dispose() {
    WakelockPlus.disable();
    super.dispose();
  }

  void _onMissionFinished() async {
    setState(() {
      _missionCompleted = true;
    });

    // إيقاف صوت المنبه الصاخب فور اكتمال المهمة بنجاح
    await AlarmService.stopAlarm(widget.alarmId);
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      // منع إغلاق الشاشة بزر الرجوع قبل إنجاز المهمة
      onWillPop: () async => _missionCompleted,
      child: Scaffold(
        backgroundColor: const Color(0xFF0F172A), // خلفية ليلية داكنة
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
            child: Column(
              children: [
                // رأس الشاشة مع وقت الفجر والتنبيه
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.alarm, color: Colors.amber, size: 28),
                    const SizedBox(width: 8),
                    Text(
                      _missionCompleted ? 'تقبل الله طاعتكم!' : 'حان موعد الاستيقاظ لصلاة الفجر',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: _missionCompleted ? Colors.emerald : Colors.amber,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  widget.config.wakeUpTime,
                  style: const TextStyle(
                    fontSize: 48,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 2,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 6),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.white10,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    '«الصلاة خيرٌ من النوم»',
                    style: TextStyle(fontSize: 14, color: Colors.amber.shade200),
                  ),
                ),
                const Divider(color: Colors.white24, height: 40),

                // قسم المهمة أو رسالة النجاح
                Expanded(
                  child: Center(
                    child: SingleChildScrollView(
                      child: _missionCompleted
                          ? _buildSuccessView()
                          : _buildMissionView(),
                    ),
                  ),
                ),

                // زر الإنهاء يظهر فقط بعد إتمام المهمة
                if (_missionCompleted)
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.emerald,
                      minimumSize: const Size.fromHeight(56),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                    onPressed: () {
                      Navigator.of(context).pop();
                    },
                    child: const Text(
                      'تم الاستيقاظ والحمد لله',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildMissionView() {
    switch (widget.config.missionType) {
      case MissionType.tasbih:
        return TasbihMissionWidget(
          targetCount: widget.config.tasbihCount,
          phrase: widget.config.tasbihPhrase,
          onCompleted: _onMissionFinished,
        );

      case MissionType.religiousQuiz:
        return QuizMissionWidget(
          questionsCount: widget.config.religiousQuestionsCount,
          onCompleted: _onMissionFinished,
        );

      case MissionType.mathQuiz:
        return MathMissionWidget(
          totalCount: widget.config.mathQuestionsCount,
          difficulty: widget.config.mathDifficulty,
          onCompleted: _onMissionFinished,
        );

      case MissionType.dhikr:
        return Column(
          children: [
            const Text(
              'أذكار الاستيقاظ',
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.emerald),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white10,
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Text(
                '«الحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ»',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 18, height: 1.6, color: Colors.white),
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.emerald,
                padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 14),
              ),
              onPressed: _onMissionFinished,
              child: const Text('قرأت الذكر واستيقظت'),
            ),
          ],
        );
    }
  }

  Widget _buildSuccessView() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Container(
          width: 80,
          height: 80,
          decoration: const BoxDecoration(
            color: Colors.emerald,
            shape: BoxShape.circle,
          ),
          child: const Icon(Icons.check, size: 48, color: Colors.white),
        ),
        const SizedBox(height: 20),
        const Text(
          'أحسنت! أتممت مهمتك واستيقظت',
          style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.white),
        ),
        const SizedBox(height: 8),
        const Text(
          'هنيئاً لك صلاة الفجر في وقتها، يومك مبارك بإذن الله',
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 15, color: Colors.white70),
        ),
      ],
    );
  }
}
