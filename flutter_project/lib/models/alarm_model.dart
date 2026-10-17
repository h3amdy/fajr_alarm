import 'dart:convert';

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
  final String fajrTime; // e.g. "04:52"
  final int offsetMinutes; // 0, -5, -10, -15, -30
  final String wakeUpTime; // e.g. "04:37"
  final MissionType missionType;
  final int tasbihCount; // 3, 5, 8, 10, 33
  final String tasbihPhrase;
  final int religiousQuestionsCount;
  final int mathQuestionsCount;
  final MathDifficulty mathDifficulty;
  final String selectedToneId; // 'tone_qom', 'tone_adhan', 'tone_quran'
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

class QuizQuestion {
  final String id;
  final String question;
  final List<String> options;
  final int correctIndex;

  const QuizQuestion({
    required this.id,
    required this.question,
    required this.options,
    required this.correctIndex,
  });
}

// قائمة النغمات الثلاث الأساسية
final List<AlarmTone> kAlarmTones = [
  const AlarmTone(
    id: 'tone_qom',
    title: 'النغمة الأولى: قم يا أخي (تذكير نبوي وأذان)',
    subtitle: '«بشر المشائين في الظلم... أثقل صلاة على المنافقين»',
    icon: '📢',
    durationLabel: '1:33 دقيقة',
    description: 'نداء حازم ومحفز يتضمن الأذان وتذكيراً بأحاديث النبي ﷺ في فضل الفجر.',
    assetPath: 'assets/audio/tone_qom.mp3',
  ),
  const AlarmTone(
    id: 'tone_adhan',
    title: 'النغمة الثانية: الصلاة خير من النوم (أذان ندي خاشع)',
    subtitle: 'ترتيل نداء الفجر بخشوع وسكينة في سكون الليل',
    icon: '🕌',
    durationLabel: '0:33 دقيقة',
    description: 'نداء الفجر المؤثر بصوت شجي يكرر «الصلاة خير من النوم» بهدوء وسكينة.',
    assetPath: 'assets/audio/tone_adhan.mp3',
  ),
  const AlarmTone(
    id: 'tone_quran',
    title: 'النغمة الثالثة: إن المتقين في جنات (تلاوة خاشعة)',
    subtitle: '«كانوا قليلاً من الليل ما يهجعون وبالأسحار هم يستغفرون»',
    icon: '📖',
    durationLabel: '0:56 دقيقة',
    description: 'تلاوة قرآنية خاشعة ومؤثرة من سورة الذاريات تذكر بالاستغفار في الأسحار والجنة.',
    assetPath: 'assets/audio/tone_quran.mp3',
  ),
];

// أذكار وعبارات التسبيح
final List<String> kTasbihPhrases = [
  'سُبْحَانَ اللَّهِ',
  'الحَمْدُ لِلَّهِ',
  'لَا إِلَهَ إِلَّا اللَّهُ',
  'اللَّهُ أَكْبَرُ',
  'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',
  'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ',
  'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ ، سُبْحَانَ اللَّهِ العَظِيمِ',
  'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
];

// بنك الأسئلة الدينية الخفيفة للاستيقاظ
final List<QuizQuestion> kReligiousQuestions = [
  const QuizQuestion(
    id: 'q1',
    question: 'ما عدد الصلوات المفروضة في اليوم والليلة؟',
    options: ['3 صلوات', '4 صلوات', '5 صلوات', '6 صلوات'],
    correctIndex: 2,
  ),
  const QuizQuestion(
    id: 'q2',
    question: 'ما هي أول صلاة يصليها المسلم في بداية يومه؟',
    options: ['صلاة الظهر', 'صلاة الفجر', 'صلاة العصر', 'صلاة الوتر'],
    correctIndex: 1,
  ),
  const QuizQuestion(
    id: 'q3',
    question: 'كم عدد ركعات سنة الفجر القبلية المؤكدة؟',
    options: ['ركعة واحدة', 'ركعتان خفيفتان', 'ثلاث ركعات', 'أربع ركعات'],
    correctIndex: 1,
  ),
  const QuizQuestion(
    id: 'q4',
    question: 'ما هي أقصر سورة في القرآن الكريم؟',
    options: ['سورة الإخلاص', 'سورة الفلق', 'سورة الكوثر', 'سورة الناس'],
    correctIndex: 2,
  ),
  const QuizQuestion(
    id: 'q5',
    question: 'ما هو الركن الثاني من أركان الإسلام؟',
    options: ['إيتاء الزكاة', 'إقام الصلاة', 'صوم رمضان', 'حج البيت'],
    correctIndex: 1,
  ),
  const QuizQuestion(
    id: 'q6',
    question: 'ما هي السورة التي تعدل ثلث القرآن في الأجر؟',
    options: ['سورة الفاتحة', 'سورة الكهف', 'سورة الإخلاص', 'سورة النور'],
    correctIndex: 2,
  ),
];
