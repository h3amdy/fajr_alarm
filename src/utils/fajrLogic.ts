export type MissionType = 'dhikr' | 'tasbih' | 'religious_quiz' | 'math_quiz';
export type MathDifficulty = 'easy' | 'medium' | 'hard';
export type AlarmToneId = 'tone_qom' | 'tone_adhan' | 'tone_quran';

export interface AlarmTone {
  id: AlarmToneId;
  title: string;
  subtitle: string;
  icon: string;
  durationLabel: string;
  description: string;
  audioUrl: string;
}

export const ALARM_TONES: AlarmTone[] = [
  {
    id: 'tone_qom',
    title: 'النغمة الأولى: قم يا أخي (تذكير نبوي وأذان)',
    subtitle: '«بشر المشائين في الظلم... أثقل صلاة على المنافقين»',
    icon: '📢',
    durationLabel: '1:33 دقيقة',
    description: 'نداء حازم ومحفز يتضمن الأذان وتذكيراً بأحاديث النبي ﷺ في فضل الفجر وعقوبة التثاقل.',
    audioUrl: '/audio/tone_qom.mp3',
  },
  {
    id: 'tone_adhan',
    title: 'النغمة الثانية: الصلاة خير من النوم (أذان ندي خاشع)',
    subtitle: 'ترتيل نداء الفجر بخشوع وسكينة في سكون الليل',
    icon: '🕌',
    durationLabel: '0:33 دقيقة',
    description: 'نداء الفجر المؤثر بصوت شجي يكرر «الصلاة خير من النوم» بهدوء وسكينة.',
    audioUrl: '/audio/tone_adhan.mp3',
  },
  {
    id: 'tone_quran',
    title: 'النغمة الثالثة: إن المتقين في جنات (تلاوة خاشعة)',
    subtitle: '«كانوا قليلاً من الليل ما يهجعون وبالأسحار هم يستغفرون»',
    icon: '📖',
    durationLabel: '0:56 دقيقة',
    description: 'تلاوة قرآنية خاشعة ومؤثرة من سورة الذاريات تذكر بالاستغفار في الأسحار والجنة.',
    audioUrl: '/audio/tone_quran.mp3',
  },
];

export interface AlarmConfig {
  fajrTime: string; // "04:52"
  offsetMinutes: number; // 0, -5, -10, -15, -30
  wakeUpTime: string; // "04:37"
  missionType: MissionType;
  tasbihCount: number; // 3, 5, 8, 10, 33, or custom
  tasbihPhrase: string; // "سبحان الله", "الحمد لله", etc.
  religiousQuestionsCount: number; // 1, 2, 3, or custom
  mathQuestionsCount: number; // 1, 2, 3, or custom
  mathDifficulty: MathDifficulty;
  selectedToneId: AlarmToneId; // The chosen alarm sound
  isEnabled: boolean;
  city: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  hint?: string;
}

export const TASBIH_PHRASES = [
  'سُبْحَانَ اللَّهِ',
  'الحَمْدُ لِلَّهِ',
  'لَا إِلَهَ إِلَّا اللَّهُ',
  'اللَّهُ أَكْبَرُ',
  'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',
  'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ',
  'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ ، سُبْحَانَ اللَّهِ العَظِيمِ',
  'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
];

export const RELIGIOUS_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'ما عدد الصلوات المفروضة في اليوم والليلة؟',
    options: ['3 صلوات', '4 صلوات', '5 صلوات', '6 صلوات'],
    correctIndex: 2,
  },
  {
    id: 'q2',
    question: 'ما هي أول صلاة يصليها المسلم في بداية يومه؟',
    options: ['صلاة الظهر', 'صلاة الفجر', 'صلاة العصر', 'صلاة الوتر'],
    correctIndex: 1,
  },
  {
    id: 'q3',
    question: 'كم عدد ركعات سنة الفجر القبلية المؤكدة؟',
    options: ['ركعة واحدة', 'ركعتان خفيفتان', 'ثلاث ركعات', 'أربع ركعات'],
    correctIndex: 1,
  },
  {
    id: 'q4',
    question: 'ما هي أقصر سورة في القرآن الكريم؟',
    options: ['سورة الإخلاص', 'سورة الفلق', 'سورة الكوثر', 'سورة الناس'],
    correctIndex: 2,
  },
  {
    id: 'q5',
    question: 'ما هو الركن الثاني من أركان الإسلام؟',
    options: ['إيتاء الزكاة', 'إقام الصلاة', 'صوم رمضان', 'حج البيت'],
    correctIndex: 1,
  },
  {
    id: 'q6',
    question: 'في أي شهر نزل القرآن الكريم؟',
    options: ['شهر رجب', 'شهر شعبان', 'شهر رمضان', 'شهر ذي الحجة'],
    correctIndex: 2,
  },
  {
    id: 'q7',
    question: 'ما هي السورة التي تسمى عروس القرآن؟',
    options: ['سورة يس', 'سورة الرحمن', 'سورة الواقعة', 'سورة الملك'],
    correctIndex: 1,
  },
  {
    id: 'q8',
    question: 'من هو خاتم الأنبياء والمرسلين؟',
    options: ['نوح عليه السلام', 'إبراهيم عليه السلام', 'موسى عليه السلام', 'محمد ﷺ'],
    correctIndex: 3,
  },
  {
    id: 'q9',
    question: 'كم عدد أجزاء القرآن الكريم؟',
    options: ['20 جزءاً', '30 جزءاً', '40 جزءاً', '60 جزءاً'],
    correctIndex: 1,
  },
  {
    id: 'q10',
    question: 'ما هي السورة التي تعدل ثلث القرآن في الأجر؟',
    options: ['سورة الفاتحة', 'سورة الكهف', 'سورة الإخلاص', 'سورة النور'],
    correctIndex: 2,
  },
  {
    id: 'q11',
    question: 'ما هي أطول سورة في القرآن الكريم؟',
    options: ['سورة آل عمران', 'سورة النساء', 'سورة البقرة', 'سورة المائدة'],
    correctIndex: 2,
  },
  {
    id: 'q12',
    question: 'كم عدد ركعات صلاة الصبح (الفجر المفروضة)؟',
    options: ['ركعة واحدة', 'ركعتان', 'ثلاث ركعات', 'أربع ركعات'],
    correctIndex: 1,
  },
  {
    id: 'q13',
    question: 'ما هو اسم أم النبي محمد ﷺ؟',
    options: ['خديجة بنت خويلد', 'آمنة بنت وهب', 'فاطمة الزهراء', 'حليمة السعدية'],
    correctIndex: 1,
  },
  {
    id: 'q14',
    question: 'ما هو الجبل الذي كلم الله عنده نبيه موسى عليه السلام؟',
    options: ['جبل أحد', 'جبل النور', 'جبل الطور', 'جبل عرفات'],
    correctIndex: 2,
  },
  {
    id: 'q15',
    question: 'ما هي أعظم آية في كتاب الله تعالى؟',
    options: ['آية الدين', 'آية الكرسي', 'آخر سورة البقرة', 'أول سورة آل عمران'],
    correctIndex: 1,
  },
  {
    id: 'q16',
    question: 'من هو أول الخلفاء الراشدين رضي الله عنهم؟',
    options: ['عمر بن الخطاب', 'عثمان بن عفان', 'علي بن أبي طالب', 'أبو بكر الصديق'],
    correctIndex: 3,
  },
  {
    id: 'q17',
    question: 'ما هي السورة التي تسمى السبع المثاني؟',
    options: ['سورة الفاتحة', 'سورة البقرة', 'سورة يوسف', 'سورة طه'],
    correctIndex: 0,
  },
  {
    id: 'q18',
    question: 'ما هي الصلاة التي ليس فيها ركوع ولا سجود؟',
    options: ['صلاة الكسوف', 'صلاة الجنازة', 'صلاة الاستسقاء', 'صلاة العيد'],
    correctIndex: 1,
  },
  {
    id: 'q19',
    question: 'كم عدد أركان الإسلام؟',
    options: ['4 أركان', '5 أركان', '6 أركان', '7 أركان'],
    correctIndex: 1,
  },
  {
    id: 'q20',
    question: 'كم عدد أركان الإيمان؟',
    options: ['5 أركان', '6 أركان', '7 أركان', '3 أركان'],
    correctIndex: 1,
  },
  {
    id: 'q21',
    question: 'ما اسم الغار الذي كان يتعبد فيه النبي ﷺ قبل البعثة؟',
    options: ['غار ثور', 'غار حراء', 'غار أحد', 'غار طوى'],
    correctIndex: 1,
  },
  {
    id: 'q22',
    question: 'من هو النبي الذي سخر الله له الريح والجن وألان له الحديد؟',
    options: ['سليمان عليه السلام', 'داود عليه السلام', 'يوسف عليه السلام', 'إبراهيم عليه السلام'],
    correctIndex: 0,
  },
  {
    id: 'q23',
    question: 'ما هي السورة الوحيدة في القرآن التي لا تبدأ بالبسملة؟',
    options: ['سورة الأنفال', 'سورة التوبة', 'سورة الحشر', 'سورة النمل'],
    correctIndex: 1,
  },
  {
    id: 'q24',
    question: 'ما هي قبلة المسلمين الأولى قبل تحويلها إلى الكعبة؟',
    options: ['الكعبة المشرفة', 'المسجد الأقصى', 'المسجد النبوي', 'مسجد قباء'],
    correctIndex: 1,
  },
  {
    id: 'q25',
    question: 'ما اسم مؤذن رسول الله ﷺ الأول في الإسلام؟',
    options: ['بلال بن رباح', 'عبد الله بن مسعود', 'سلمان الفارسي', 'أبو هريرة'],
    correctIndex: 0,
  },
  {
    id: 'q26',
    question: 'ما فضل ركعتي الفجر (السنة القبلية) كما قال النبي ﷺ؟',
    options: ['خير من الدنيا وما فيها', 'تعدل قيام الليل كله', 'تمحو كل الخطايا', 'أفضل من حجة'],
    correctIndex: 0,
  },
  {
    id: 'q27',
    question: 'قال ﷺ: «من صلى البردين دخل الجنة» ما هما البردان؟',
    options: ['الظهر والعصر', 'الفجر والعصر', 'المغرب والعشاء', 'الفجر والمغرب'],
    correctIndex: 1,
  },
  {
    id: 'q28',
    question: 'ما هي جملة التثويب التي تضاف في أذان الفجر خاصة؟',
    options: ['حي على الفلاح', 'الصلاة خير من النوم', 'قد قامت الصلاة', 'لا إله إلا الله'],
    correctIndex: 1,
  },
  {
    id: 'q29',
    question: 'قال النبي ﷺ: «من صلى الصبح في جماعة فهو في...»؟',
    options: ['ذمة الله', 'حفظ الملائكة', 'أمان السلطان', 'نعيم مقيم'],
    correctIndex: 0,
  },
  {
    id: 'q30',
    question: 'ما هي السورة التي تستحب قراءتها يوم الجمعة لنيل نور بين الجمعتين؟',
    options: ['سورة يس', 'سورة الكهف', 'سورة الملك', 'سورة مريم'],
    correctIndex: 1,
  },
  {
    id: 'q31',
    question: 'ما هي السورة المنجية من عذاب القبر الموصى بقراءتها كل ليلة؟',
    options: ['سورة الواقعة', 'سورة الملك (تبارك)', 'سورة الدخان', 'سورة الصافات'],
    correctIndex: 1,
  },
  {
    id: 'q32',
    question: 'ما اسم أول مسجد بني في الإسلام؟',
    options: ['المسجد الحرام', 'المسجد النبوي', 'مسجد قباء', 'مسجد القبلتين'],
    correctIndex: 2,
  },
  {
    id: 'q33',
    question: 'من هي أول زوجات النبي ﷺ وأول من آمن به من النساء؟',
    options: ['عائشة رضي الله عنها', 'خديجة رضي الله عنها', 'حفصة رضي الله عنها', 'سودة رضي الله عنها'],
    correctIndex: 1,
  },
  {
    id: 'q34',
    question: 'ما هي الكلمة التي هي ثقيلة في الميزان حبيبة إلى الرحمن؟',
    options: ['سبحان الله وبحمده سبحان الله العظيم', 'أستغفر الله', 'الحمد لله', 'لا حول ولا قوة إلا بالله'],
    correctIndex: 0,
  },
  {
    id: 'q35',
    question: 'كم مرة ركع النبي ﷺ في صلاة الكسوف في الركعة الواحدة؟',
    options: ['ركوع واحد', 'ركوعان', 'ثلاثة ركوعات', 'أربعة ركوعات'],
    correctIndex: 1,
  },
  {
    id: 'q36',
    question: 'ما هي السورة التي ذكرت فيها البسملة مرتين؟',
    options: ['سورة النمل', 'سورة النحل', 'سورة النجم', 'سورة النور'],
    correctIndex: 0,
  },
  {
    id: 'q37',
    question: 'ما هو الدعاء الذي يقال في الركعة الأخيرة من الوتر؟',
    options: ['دعاء الاستخارة', 'دعاء القنوت', 'دعاء الركوب', 'دعاء السفر'],
    correctIndex: 1,
  },
  {
    id: 'q38',
    question: 'ما هو اسم الصحابي الذي لقب بـ «سيف الله المسلول»؟',
    options: ['حمزة بن عبد المطلب', 'علي بن أبي طالب', 'خالد بن الوليد', 'سعد بن أبي وقاص'],
    correctIndex: 2,
  },
  {
    id: 'q39',
    question: 'كم سنة استمرت دعوة النبي ﷺ في مكة المكرمة قبل الهجرة؟',
    options: ['10 سنوات', '13 سنة', '15 سنة', '20 سنة'],
    correctIndex: 1,
  },
  {
    id: 'q40',
    question: 'ما هو الوقت الفاضل المستحب للاستغفار كما في قوله تعالى: «وَبِالأَسْحَارِ هُمْ يَسْتَغْفِرُونَ»؟',
    options: ['وقت الظهيرة', 'وقت العصر', 'الثلث الأخير من الليل قبيل الفجر', 'بعد شروق الشمس'],
    correctIndex: 2,
  },
];

export const DHIKR_AWAKENING = {
  text: 'الحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
  source: 'رواه البخاري ومسلم',
  instruction: 'اقرأ الذكر بتدبر ثم اضغط على الزر لإيقاف المنبه',
};

/**
 * Calculates wake up time from a Fajr 24h string and negative/zero offset minutes
 */
export function calculateWakeUpTime(fajrTimeStr: string, offsetMinutes: number): string {
  const [hours, minutes] = fajrTimeStr.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + offsetMinutes;
  
  const normalizedMinutes = (totalMinutes + 24 * 60) % (24 * 60);
  const wakeHours = Math.floor(normalizedMinutes / 60);
  const wakeMins = normalizedMinutes % 60;

  return `${String(wakeHours).padStart(2, '0')}:${String(wakeMins).padStart(2, '0')}`;
}

/**
 * Formats time from "04:52" to Arabic 12h format e.g. "04:52 ص"
 */
export function formatArabicTime(time24: string): string {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'م' : 'ص';
  const hours12 = hours % 12 || 12;
  const padHours = String(hours12).padStart(2, '0');
  const padMins = String(minutes).padStart(2, '0');
  return `${padHours}:${padMins} ${period}`;
}

/**
 * Formats offset in minutes into human Arabic label
 */
export function formatOffsetLabel(offsetMinutes: number): string {
  if (offsetMinutes === 0) {
    return 'عند الفجر';
  }
  const abs = Math.abs(offsetMinutes);
  return `قبل الفجر بـ ${abs} د`;
}

export interface MathProblem {
  num1: number;
  num2: number;
  op: '+' | '-' | '×';
  answer: number;
}

/**
 * Generates math problems according to difficulty
 */
export function generateMathProblem(difficulty: MathDifficulty = 'medium'): MathProblem {
  if (difficulty === 'easy') {
    const num1 = Math.floor(Math.random() * 15) + 3;
    const num2 = Math.floor(Math.random() * 12) + 2;
    const isAddition = Math.random() > 0.3;
    if (isAddition) {
      return { num1, num2, op: '+', answer: num1 + num2 };
    } else {
      const higher = Math.max(num1, num2);
      const lower = Math.min(num1, num2);
      return { num1: higher, num2: lower, op: '-', answer: higher - lower };
    }
  }

  if (difficulty === 'hard') {
    const isMultiplication = Math.random() > 0.4;
    if (isMultiplication) {
      const num1 = Math.floor(Math.random() * 8) + 3;
      const num2 = Math.floor(Math.random() * 9) + 4;
      return { num1, num2, op: '×', answer: num1 * num2 };
    }
    const num1 = Math.floor(Math.random() * 45) + 25;
    const num2 = Math.floor(Math.random() * 40) + 15;
    return { num1, num2, op: '+', answer: num1 + num2 };
  }

  // Medium (standard default)
  const num1 = Math.floor(Math.random() * 30) + 12;
  const num2 = Math.floor(Math.random() * 25) + 8;
  const isAddition = Math.random() > 0.4;

  if (isAddition) {
    return { num1, num2, op: '+', answer: num1 + num2 };
  } else {
    const higher = Math.max(num1, num2);
    const lower = Math.min(num1, num2);
    return { num1: higher, num2: lower, op: '-', answer: higher - lower };
  }
}

/**
 * Validates a math answer
 */
export function checkMathAnswer(userAnswer: string, expectedAnswer: number): boolean {
  const parsed = parseInt(userAnswer.trim(), 10);
  return !isNaN(parsed) && parsed === expectedAnswer;
}

/**
 * Returns N distinct random religious questions
 */
export function getDistinctReligiousQuestions(count: number): QuizQuestion[] {
  const shuffled = [...RELIGIOUS_QUESTIONS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Formats date into Arabic display
 */
export function formatTodayArabic(): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  };
  try {
    return new Intl.DateTimeFormat('ar-SA', options).format(new Date());
  } catch {
    return 'الأربعاء 7 أكتوبر';
  }
}
