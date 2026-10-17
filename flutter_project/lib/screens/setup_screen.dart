import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../models/alarm_model.dart';
import '../services/alarm_service.dart';

class SetupScreen extends StatefulWidget {
  final AlarmConfig initialConfig;

  const SetupScreen({super.key, required this.initialConfig});

  @override
  State<SetupScreen> createState() => _SetupScreenState();
}

class _SetupScreenState extends State<SetupScreen> {
  late int _offsetMinutes;
  late MissionType _missionType;
  late String _selectedToneId;
  late int _tasbihCount;
  late String _tasbihPhrase;
  late int _quizQuestionsCount;
  late int _mathQuestionsCount;
  late MathDifficulty _mathDifficulty;
  String? _currentlyPlayingTone;

  @override
  void initState() {
    super.initState();
    _offsetMinutes = widget.initialConfig.offsetMinutes;
    _missionType = widget.initialConfig.missionType;
    _selectedToneId = widget.initialConfig.selectedToneId;
    _tasbihCount = widget.initialConfig.tasbihCount;
    _tasbihPhrase = widget.initialConfig.tasbihPhrase;
    _quizQuestionsCount = widget.initialConfig.religiousQuestionsCount;
    _mathQuestionsCount = widget.initialConfig.mathQuestionsCount;
    _mathDifficulty = widget.initialConfig.mathDifficulty;
  }

  @override
  void dispose() {
    AlarmService.stopPreview();
    super.dispose();
  }

  void _previewTone(AlarmTone tone) async {
    if (_currentlyPlayingTone == tone.id) {
      await AlarmService.stopPreview();
      setState(() => _currentlyPlayingTone = null);
    } else {
      await AlarmService.playPreview(tone.assetPath);
      setState(() => _currentlyPlayingTone = tone.id);
    }
  }

  void _save() {
    final updated = AlarmConfig(
      fajrTime: widget.initialConfig.fajrTime,
      offsetMinutes: _offsetMinutes,
      wakeUpTime: widget.initialConfig.wakeUpTime,
      missionType: _missionType,
      tasbihCount: _tasbihCount,
      tasbihPhrase: _tasbihPhrase,
      religiousQuestionsCount: _quizQuestionsCount,
      mathQuestionsCount: _mathQuestionsCount,
      mathDifficulty: _mathDifficulty,
      selectedToneId: _selectedToneId,
      isEnabled: widget.initialConfig.isEnabled,
      city: widget.initialConfig.city,
    );

    Navigator.of(context).pop(updated);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('إعدادات المنبه والمهمة'),
        actions: [
          TextButton(
            onPressed: _save,
            child: const Text(
              'حفظ',
              style: TextStyle(color: AppColors.emerald, fontWeight: FontWeight.bold, fontSize: 16),
            ),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // 1. وقت الاستيقاظ قبل الفجر
          _buildCard(
            title: 'موعد رنين المنبه بالنسبة للفجر',
            icon: Icons.access_time,
            child: Wrap(
              spacing: 8,
              children: [0, -5, -10, -15, -20, -30].map((mins) {
                final isSelected = _offsetMinutes == mins;
                final label = mins == 0 ? 'مع أذان الفجر' : 'قبل الفجر بـ ${-mins} دقيقة';
                return ChoiceChip(
                  label: Text(label),
                  selected: isSelected,
                  selectedColor: AppColors.emerald,
                  onSelected: (val) {
                    if (val) setState(() => _offsetMinutes = mins);
                  },
                );
              }).toList(),
            ),
          ),

          const SizedBox(height: 16),

          // 2. نوع المهمة
          _buildCard(
            title: 'مهمة الاستيقاظ لإيقاف المنبه',
            icon: Icons.checklist,
            child: Column(
              children: [
                _buildMissionRadio(
                  type: MissionType.tasbih,
                  title: 'التسبيح والذكر',
                  subtitle: 'الضغط المتكرر على عداد التسبيح الذكي',
                  icon: Icons.fingerprint,
                ),
                _buildMissionRadio(
                  type: MissionType.religiousQuiz,
                  title: 'أسئلة دينية خفيفة',
                  subtitle: 'تنشيط الذهن بأسئلة إسلامية سهلة',
                  icon: Icons.menu_book,
                ),
                _buildMissionRadio(
                  type: MissionType.mathQuiz,
                  title: 'مسائل حسابية',
                  subtitle: 'عمليات جمع وضرب سريعة لتنشيط العقل',
                  icon: Icons.calculate,
                ),
                _buildMissionRadio(
                  type: MissionType.dhikr,
                  title: 'أذكار الاستيقاظ المأثورة',
                  subtitle: 'قراءة ذكر الاستيقاظ والتأكيد',
                  icon: Icons.wb_sunny,
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // تفاصيل المهمة المختارة
          if (_missionType == MissionType.tasbih)
            _buildCard(
              title: 'عدد التسبيحات',
              icon: Icons.numbers,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [3, 5, 10, 33].map((count) {
                  return ChoiceChip(
                    label: Text('$count مرات'),
                    selected: _tasbihCount == count,
                    selectedColor: AppColors.emerald,
                    onSelected: (val) {
                      if (val) setState(() => _tasbihCount = count);
                    },
                  );
                }).toList(),
              ),
            ),

          if (_missionType == MissionType.mathQuiz)
            _buildCard(
              title: 'صعوبة العمليات الحسابية',
              icon: Icons.tune,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  ChoiceChip(
                    label: const Text('سهل (جمع)'),
                    selected: _mathDifficulty == MathDifficulty.easy,
                    selectedColor: AppColors.emerald,
                    onSelected: (val) => setState(() => _mathDifficulty = MathDifficulty.easy),
                  ),
                  ChoiceChip(
                    label: const Text('متوسط'),
                    selected: _mathDifficulty == MathDifficulty.medium,
                    selectedColor: AppColors.emerald,
                    onSelected: (val) => setState(() => _mathDifficulty = MathDifficulty.medium),
                  ),
                  ChoiceChip(
                    label: const Text('متقدم (ضرب)'),
                    selected: _mathDifficulty == MathDifficulty.hard,
                    selectedColor: AppColors.emerald,
                    onSelected: (val) => setState(() => _mathDifficulty = MathDifficulty.hard),
                  ),
                ],
              ),
            ),

          const SizedBox(height: 16),

          // 3. اختيار النغمة
          _buildCard(
            title: 'نغمة المنبه (أصوات هادفة ومحفزة)',
            icon: Icons.music_note,
            child: Column(
              children: kAlarmTones.map((tone) {
                final isSelected = _selectedToneId == tone.id;
                final isPlaying = _currentlyPlayingTone == tone.id;

                return Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: isSelected ? AppColors.emerald : Colors.white12,
                      width: isSelected ? 2 : 1,
                    ),
                    color: isSelected ? AppColors.emerald.withOpacity(0.08) : Colors.transparent,
                  ),
                  child: ListTile(
                    leading: Text(tone.icon, style: const TextStyle(fontSize: 24)),
                    title: Text(tone.title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                    subtitle: Text(tone.subtitle, style: const TextStyle(fontSize: 12)),
                    trailing: IconButton(
                      icon: Icon(
                        isPlaying ? Icons.stop_circle : Icons.play_circle_fill,
                        color: AppColors.emerald,
                        size: 32,
                      ),
                      onPressed: () => _previewTone(tone),
                    ),
                    onTap: () {
                      setState(() => _selectedToneId = tone.id);
                    },
                  ),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCard({required String title, required IconData icon, required Widget child}) {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              children: [
                Icon(icon, color: AppColors.emerald, size: 20),
                const SizedBox(width: 8),
                Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
              ],
            ),
            const SizedBox(height: 12),
            child,
          ],
        ),
      ),
    );
  }

  Widget _buildMissionRadio({
    required MissionType type,
    required String title,
    required String subtitle,
    required IconData icon,
  }) {
    final isSelected = _missionType == type;
    return RadioListTile<MissionType>(
      value: type,
      groupValue: _missionType,
      activeColor: AppColors.emerald,
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
      subtitle: Text(subtitle, style: const TextStyle(fontSize: 12)),
      secondary: Icon(icon, color: isSelected ? AppColors.emerald : Colors.grey),
      onChanged: (val) {
        if (val != null) setState(() => _missionType = val);
      },
    );
  }
}
