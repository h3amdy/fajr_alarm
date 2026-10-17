import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateWakeUpTime,
  formatArabicTime,
  formatOffsetLabel,
  checkMathAnswer,
  generateMathProblem,
  RELIGIOUS_QUESTIONS,
  ALARM_TONES,
  getDistinctReligiousQuestions,
  verifyBarcodeMatch,
  EMERGENCY_PENALTY_CONFIG,
} from './fajrLogic.ts';

test('calculateWakeUpTime computes exact time with negative offsets', () => {
  assert.equal(calculateWakeUpTime('04:52', -15), '04:37');
  assert.equal(calculateWakeUpTime('04:52', 0), '04:52');
  assert.equal(calculateWakeUpTime('04:52', -5), '04:47');
  assert.equal(calculateWakeUpTime('04:52', -30), '04:22');
  assert.equal(calculateWakeUpTime('00:10', -15), '23:55');
});

test('formatArabicTime formats 24h into 12h Arabic notation', () => {
  assert.equal(formatArabicTime('04:52'), '04:52 ص');
  assert.equal(formatArabicTime('16:30'), '04:30 م');
  assert.equal(formatArabicTime('00:05'), '12:05 ص');
});

test('formatOffsetLabel outputs respectful Arabic labels', () => {
  assert.equal(formatOffsetLabel(0), 'عند الفجر');
  assert.equal(formatOffsetLabel(-15), 'قبل الفجر بـ 15 د');
  assert.equal(formatOffsetLabel(-30), 'قبل الفجر بـ 30 د');
});

test('checkMathAnswer validates numerical equality safely', () => {
  assert.equal(checkMathAnswer('45', 45), true);
  assert.equal(checkMathAnswer(' 45 ', 45), true);
  assert.equal(checkMathAnswer('44', 45), false);
  assert.equal(checkMathAnswer('invalid', 45), false);
});

test('generateMathProblem produces correct math problems for easy, medium, and hard', () => {
  const easy = generateMathProblem('easy');
  if (easy.op === '+') assert.equal(easy.num1 + easy.num2, easy.answer);
  else assert.equal(easy.num1 - easy.num2, easy.answer);

  const hard = generateMathProblem('hard');
  if (hard.op === '×') assert.equal(hard.num1 * hard.num2, hard.answer);
  else if (hard.op === '+') assert.equal(hard.num1 + hard.num2, hard.answer);
});

test('RELIGIOUS_QUESTIONS has 40 authentic verified questions with 4 options each', () => {
  assert.equal(RELIGIOUS_QUESTIONS.length, 40);
  for (const q of RELIGIOUS_QUESTIONS) {
    assert.ok(q.question.length > 5);
    assert.equal(q.options.length, 4);
    assert.ok(q.correctIndex >= 0 && q.correctIndex < q.options.length);
  }
});

test('ALARM_TONES defines exactly 3 selectable waking tones with audio files', () => {
  assert.equal(ALARM_TONES.length, 3);
  const ids = ALARM_TONES.map((t) => t.id);
  assert.deepEqual(ids, ['tone_qom', 'tone_adhan', 'tone_quran']);
  for (const tone of ALARM_TONES) {
    assert.ok(tone.audioUrl && tone.audioUrl.endsWith('.mp3'));
    assert.ok(tone.durationLabel.length > 0);
  }
});

test('getDistinctReligiousQuestions returns unique questions', () => {
  const questions = getDistinctReligiousQuestions(3);
  assert.equal(questions.length, 3);
  const ids = new Set(questions.map((q) => q.id));
  assert.equal(ids.size, 3);
});

test('verifyBarcodeMatch strictly accepts only exact normalized matches and rejects wrong barcodes', () => {
  // Exact match
  const valid = verifyBarcodeMatch('6281000456789', '6281000456789', 'معجون الأسنان بالحمام');
  assert.equal(valid.isValid, true);
  assert.equal(valid.errorReason, undefined);

  // Case & whitespace insensitive match
  const validCase = verifyBarcodeMatch('  wudu-toothpaste-786 ', 'WUDU-TOOTHPASTE-786');
  assert.equal(validCase.isValid, true);

  // Reject wrong barcode (e.g. item next to bed)
  const mismatch = verifyBarcodeMatch('999111222333', '6281000456789', 'معجون الأسنان بالحمام');
  assert.equal(mismatch.isValid, false);
  assert.ok(mismatch.errorReason && mismatch.errorReason.includes('غير مطابق'));

  // Reject empty barcode
  const empty = verifyBarcodeMatch('   ', '6281000456789');
  assert.equal(empty.isValid, false);
});

test('EMERGENCY_PENALTY_CONFIG enforces strict grace timer and penalty thresholds', () => {
  assert.equal(EMERGENCY_PENALTY_CONFIG.graceMuteSeconds, 45);
  assert.equal(EMERGENCY_PENALTY_CONFIG.maxGraceMuteUses, 2);
  assert.ok(EMERGENCY_PENALTY_CONFIG.penaltyMathCount >= 5);
  assert.ok(EMERGENCY_PENALTY_CONFIG.penaltyTasbihCount >= 33);
});

