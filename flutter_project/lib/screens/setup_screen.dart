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
          // 1. توقيت الاستيقاظ
          _buildCard(
            title: 'توقيت الاستيقاظ بالنسبة للفجر',
            icon: Icons.access_time_filled,
            child: Wrap(
              spacing: 8,
              runSpacing: 8,
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
                  subtitle: 'تنشيط الذهن بأسئلة إسلامية موثقة',
                  icon: Icons.menu_book,
                ),
                _buildMissionRadio(
                  type: MissionType.mathQuiz,
                  title: 'مسائل حسابية',
                  subtitle: 'عمليات جمع وضرب لتنشيط خلايا التفكير',
                  icon: Icons.calculate,
                ),
                _buildMissionRadio(
                  type: MissionType.dhikr,
                  title: 'أذكار الاستيقاظ المأثورة',
                  subtitle: 'قراءة ذكر الاستيقاظ المأثور وتأكيده',
                  icon: Icons.wb_sunny,
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // تفاصيل مهمة التسبيح
          if (_missionType == MissionType.tasbih) ...[
            _buildCard(
              title: 'عدد التسبيحات المطلوبة',
              icon: Icons.numbers,
              child: Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [3, 5, 7, 10, 33].map((count) {
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
            const SizedBox(height: 16),
            _buildCard(
              title: 'عبارة الذكر والتسبيح',
              icon: Icons.auto_awesome,
              child: DropdownButtonFormField<String>(
                value: kTasbihPhrases.contains(_tasbihPhrase) ? _tasbihPhrase : kTasbihPhrases[0],
                decoration: InputDecoration(
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                ),
                items: kTasbihPhrases.map((phrase) {
                  return DropdownMenuItem<String>(
                    value: phrase,
                    child: Text(phrase, style: const TextStyle(fontWeight: FontWeight.w600)),
                  );
                }).toList(),
                onChanged: (val) {
                  if (val != null) setState(() => _tasbihPhrase = val);
                },
              ),
            ),
          ],

          // تفاصيل مهمة الأسئلة الدينية (تخصيص عدد الأسئلة)
          if (_missionType == MissionType.religiousQuiz)
            _buildCard(
              title: 'عدد الأسئلة الدينية للاستيقاظ',
              icon: Icons.format_list_numbered_rtl,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'اختر عدد الأسئلة المطلوبة لإيقاف المنبه (من بنك الأسئلة الموثق 40 سؤالاً):',
                    style: TextStyle(fontSize: 12, color: Colors.grey),
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      _buildCountChip(
                        count: 1,
                        label: 'سؤال واحد',
                        current: _quizQuestionsCount,
                        onSelected: (c) => setState(() => _quizQuestionsCount = c),
                      ),
                      _buildCountChip(
                        count: 2,
                        label: 'سؤالين (موصى به)',
                        current: _quizQuestionsCount,
                        onSelected: (c) => setState(() => _quizQuestionsCount = c),
                      ),
                      _buildCountChip(
                        count: 3,
                        label: '3 أسئلة',
                        current: _quizQuestionsCount,
                        onSelected: (c) => setState(() => _quizQuestionsCount = c),
                      ),
                      _buildCountChip(
                        count: 5,
                        label: '5 أسئلة',
                        current: _quizQuestionsCount,
                        onSelected: (c) => setState(() => _quizQuestionsCount = c),
                      ),
                      _buildCountChip(
                        count: 7,
                        label: '7 أسئلة',
                        current: _quizQuestionsCount,
                        onSelected: (c) => setState(() => _quizQuestionsCount = c),
                      ),
                    ],
                  ),
                ],
              ),
            ),

          // تفاصيل مهمة المسائل الحسابية (تخصيص عدد المسائل والصعوبة)
          if (_missionType == MissionType.mathQuiz) ...[
            _buildCard(
              title: 'عدد المسائل الحسابية',
              icon: Icons.format_list_numbered,
              child: Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  _buildCountChip(
                    count: 1,
                    label: 'مسألة واحدة',
                    current: _mathQuestionsCount,
                    onSelected: (c) => setState(() => _mathQuestionsCount = c),
                  ),
                  _buildCountChip(
                    count: 2,
                    label: 'مسألتين (موصى به)',
                    current: _mathQuestionsCount,
                    onSelected: (c) => setState(() => _mathQuestionsCount = c),
                  ),
                  _buildCountChip(
                    count: 3,
                    label: '3 مسائل',
                    current: _mathQuestionsCount,
                    onSelected: (c) => setState(() => _mathQuestionsCount = c),
                  ),
                  _buildCountChip(
                    count: 5,
                    label: '5 مسائل',
                    current: _mathQuestionsCount,
                    onSelected: (c) => setState(() => _mathQuestionsCount = c),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            _buildCard(
              title: 'مستوى صعوبة العمليات الحسابية',
              icon: Icons.tune,
              child: Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  ChoiceChip(
                    label: const Text('سهل (جمع)'),
                    selected: _mathDifficulty == MathDifficulty.easy,
                    selectedColor: AppColors.emerald,
                    onSelected: (val) => setState(() => _mathDifficulty = MathDifficulty.easy),
                  ),
                  ChoiceChip(
                    label: const Text('متوسط (جمع وطرح)'),
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
          ],

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
                  child: Material(
                    color: Colors.transparent,
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
                  ),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCountChip({
    required int count,
    required String label,
    required int current,
    required ValueChanged<int> onSelected,
  }) {
    final isSelected = current == count;
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      selectedColor: AppColors.emerald,
      onSelected: (val) {
        if (val) onSelected(count);
      },
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
