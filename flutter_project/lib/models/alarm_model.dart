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

// بنك الأسئلة الدينية الكامل الموثق للاستيقاظ (40 سؤالاً)
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
    question: 'في أي شهر نزل القرآن الكريم؟',
    options: ['شهر رجب', 'شهر شعبان', 'شهر رمضان', 'شهر ذي الحجة'],
    correctIndex: 2,
  ),
  const QuizQuestion(
    id: 'q7',
    question: 'ما هي السورة التي تسمى عروس القرآن؟',
    options: ['سورة يس', 'سورة الرحمن', 'سورة الواقعة', 'سورة الملك'],
    correctIndex: 1,
  ),
  const QuizQuestion(
    id: 'q8',
    question: 'من هو خاتم الأنبياء والمرسلين؟',
    options: ['نوح عليه السلام', 'إبراهيم عليه السلام', 'موسى عليه السلام', 'محمد ﷺ'],
    correctIndex: 3,
  ),
  const QuizQuestion(
    id: 'q9',
    question: 'كم عدد أجزاء القرآن الكريم؟',
    options: ['20 جزءاً', '30 جزءاً', '40 جزءاً', '60 جزءاً'],
    correctIndex: 1,
  ),
  const QuizQuestion(
    id: 'q10',
    question: 'ما هي السورة التي تعدل ثلث القرآن في الأجر؟',
    options: ['سورة الفاتحة', 'سورة الكهف', 'سورة الإخلاص', 'سورة النور'],
    correctIndex: 2,
  ),
  const QuizQuestion(
    id: 'q11',
    question: 'ما هي أطول سورة في القرآن الكريم؟',
    options: ['سورة آل عمران', 'سورة النساء', 'سورة البقرة', 'سورة المائدة'],
    correctIndex: 2,
  ),
  const QuizQuestion(
    id: 'q12',
    question: 'كم عدد ركعات صلاة الصبح (الفجر المفروضة)؟',
    options: ['ركعة واحدة', 'ركعتان', 'ثلاث ركعات', 'أربع ركعات'],
    correctIndex: 1,
  ),
  const QuizQuestion(
    id: 'q13',
    question: 'ما هو اسم أم النبي محمد ﷺ؟',
    options: ['خديجة بنت خويلد', 'آمنة بنت وهب', 'فاطمة الزهراء', 'حليمة السعدية'],
    correctIndex: 1,
  ),
  const QuizQuestion(
    id: 'q14',
    question: 'ما هو الجبل الذي كلم الله عنده نبيه موسى عليه السلام؟',
    options: ['جبل أحد', 'جبل النور', 'جبل الطور', 'جبل عرفات'],
    correctIndex: 2,
  ),
  const QuizQuestion(
    id: 'q15',
    question: 'ما هي أعظم آية في كتاب الله تعالى؟',
    options: ['آية الدين', 'آية الكرسي', 'آخر سورة البقرة', 'أول سورة آل عمران'],
    correctIndex: 1,
  ),
  const QuizQuestion(
    id: 'q16',
    question: 'من هو أول الخلفاء الراشدين رضي الله عنهم؟',
    options: ['عمر بن الخطاب', 'عثمان بن عفان', 'علي بن أبي طالب', 'أبو بكر الصديق'],
    correctIndex: 3,
  ),
  const QuizQuestion(
    id: 'q17',
    question: 'ما هي السورة التي تسمى السبع المثاني؟',
    options: ['سورة الفاتحة', 'سورة البقرة', 'سورة يوسف', 'سورة طه'],
    correctIndex: 0,
  ),
  const QuizQuestion(
    id: 'q18',
    question: 'ما هي الصلاة التي ليس فيها ركوع ولا سجود؟',
    options: ['صلاة الكسوف', 'صلاة الجنازة', 'صلاة الاستسقاء', 'صلاة العيد'],
    correctIndex: 1,
  ),
  const QuizQuestion(
    id: 'q19',
    question: 'كم عدد أركان الإسلام؟',
    options: ['4 أركان', '5 أركان', '6 أركان', '7 أركان'],
    correctIndex: 1,
  ),
  const QuizQuestion(
    id: 'q20',
    question: 'كم عدد أركان الإيمان؟',
    options: ['5 أركان', '6 أركان', '7 أركان', '3 أركان'],
    correctIndex: 1,
  ),
  const QuizQuestion(
    id: 'q21',
    question: 'ما اسم الغار الذي كان يتعبد فيه النبي ﷺ قبل البعثة؟',
    options: ['غار ثور', 'غار حراء', 'غار أحد', 'غار طوى'],
    correctIndex: 1,
  ),
  const QuizQuestion(
    id: 'q22',
    question: 'من هو النبي الذي سخر الله له الريح والجن وألان له الحديد؟',
    options: ['سليمان عليه السلام', 'داود عليه السلام', 'يوسف عليه السلام', 'إبراهيم عليه السلام'],
    correctIndex: 0,
  ),
  const QuizQuestion(
    id: 'q23',
    question: 'ما هي السورة الوحيدة في القرآن التي لا تبدأ بالبسملة؟',
    options: ['سورة الأنفال', 'سورة التوبة', 'سورة الحشر', 'سورة النمل'],
    correctIndex: 1,
  ),
  const QuizQuestion(
    id: 'q24',
    question: 'ما هي قبلة المسلمين الأولى قبل تحويلها إلى الكعبة؟',
    options: ['الكعبة المشرفة', 'المسجد الأقصى', 'المسجد النبوي', 'مسجد قباء'],
    correctIndex: 1,
  ),
  const QuizQuestion(
    id: 'q25',
    question: 'ما اسم مؤذن رسول الله ﷺ الأول في الإسلام؟',
    options: ['بلال بن رباح', 'عبد الله بن مسعود', 'سلمان الفارسي', 'أبو هريرة'],
    correctIndex: 0,
  ),
  const QuizQuestion(
    id: 'q26',
    question: 'ما فضل ركعتي الفجر (السنة القبلية) كما قال النبي ﷺ؟',
    options: ['خير من الدنيا وما فيها', 'تعدل قيام الليل كله', 'تمحو كل الخطايا', 'أفضل من حجة'],
    correctIndex: 0,
  ),
  const QuizQuestion(
    id: 'q27',
    question: 'قال ﷺ: «من صلى البردين دخل الجنة» ما هما البردان؟',
    options: ['الظهر والعصر', 'الفجر والعصر', 'المغرب والعشاء', 'الفجر والمغرب'],
    correctIndex: 1,
  ),
  const QuizQuestion(
    id: 'q28',
    question: 'ما هي جملة التثويب التي تضاف في أذان الفجر خاصة؟',
    options: ['حي على الفلاح', 'الصلاة خير من النوم', 'قد قامت الصلاة', 'لا إله إلا الله'],
    correctIndex: 1,
  ),
  const QuizQuestion(
    id: 'q29',
    question: 'قال النبي ﷺ: «من صلى الصبح في جماعة فهو في...»؟',
    options: ['ذمة الله', 'حفظ الملائكة', 'أمان السلطان', 'نعيم مقيم'],
    correctIndex: 0,
  ),
  const QuizQuestion(
    id: 'q30',
    question: 'ما هي السورة التي تستحب قراءتها يوم الجمعة لنيل نور بين الجمعتين؟',
    options: ['سورة يس', 'سورة الكهف', 'سورة الملك', 'سورة مريم'],
    correctIndex: 1,
  ),
  const QuizQuestion(
    id: 'q31',
    question: 'ما هي السورة المنجية من عذاب القبر الموصى بقراءتها كل ليلة؟',
    options: ['سورة الواقعة', 'سورة الملك (تبارك)', 'سورة الدخان', 'سورة الصافات'],
    correctIndex: 1,
  ),
  const QuizQuestion(
    id: 'q32',
    question: 'ما اسم أول مسجد بني في الإسلام؟',
    options: ['المسجد الحرام', 'المسجد النبوي', 'مسجد قباء', 'مسجد القبلتين'],
    correctIndex: 2,
  ),
  const QuizQuestion(
    id: 'q33',
    question: 'من هي أول زوجات النبي ﷺ وأول من آمن به من النساء؟',
    options: ['عائشة رضي الله عنها', 'خديجة رضي الله عنها', 'حفصة رضي الله عنها', 'سودة رضي الله عنها'],
    correctIndex: 1,
  ),
  const QuizQuestion(
    id: 'q34',
    question: 'ما هي الكلمة التي هي ثقيلة في الميزان حبيبة إلى الرحمن؟',
    options: ['سبحان الله وبحمده سبحان الله العظيم', 'أستغفر الله', 'الحمد لله', 'لا حول ولا قوة إلا بالله'],
    correctIndex: 0,
  ),
  const QuizQuestion(
    id: 'q35',
    question: 'كم مرة ركع النبي ﷺ في صلاة الكسوف في الركعة الواحدة؟',
    options: ['ركوع واحد', 'ركوعان', 'ثلاثة ركوعات', 'أربعة ركوعات'],
    correctIndex: 1,
  ),
  const QuizQuestion(
    id: 'q36',
    question: 'ما هي السورة التي ذكرت فيها البسملة مرتين؟',
    options: ['سورة النمل', 'سورة النحل', 'سورة النجم', 'سورة النور'],
    correctIndex: 0,
  ),
  const QuizQuestion(
    id: 'q37',
    question: 'ما هو الدعاء الذي يقال في الركعة الأخيرة من الوتر؟',
    options: ['دعاء الاستخارة', 'دعاء القنوت', 'دعاء الركوب', 'دعاء السفر'],
    correctIndex: 1,
  ),
  const QuizQuestion(
    id: 'q38',
    question: 'ما هو اسم الصحابي الذي لقب بـ «سيف الله المسلول»؟',
    options: ['حمزة بن عبد المطلب', 'علي بن أبي طالب', 'خالد بن الوليد', 'سعد بن أبي وقاص'],
    correctIndex: 2,
  ),
  const QuizQuestion(
    id: 'q39',
    question: 'كم سنة استمرت دعوة النبي ﷺ في مكة المكرمة قبل الهجرة؟',
    options: ['10 سنوات', '13 سنة', '15 سنة', '20 سنة'],
    correctIndex: 1,
  ),
  const QuizQuestion(
    id: 'q40',
    question: 'ما هو الوقت الفاضل المستحب للاستغفار كما في قوله تعالى: «وَبِالأَسْحَارِ هُمْ يَسْتَغْفِرُونَ»؟',
    options: ['وقت الظهيرة', 'وقت العصر', 'الثلث الأخير من الليل قبيل الفجر', 'بعد شروق الشمس'],
    correctIndex: 2,
  ),
];
