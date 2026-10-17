import 'dart:math';
import 'package:flutter/material.dart';
import 'package:vibration/vibration.dart';
import '../constants/app_colors.dart';
import '../models/alarm_model.dart';

// ويدجت مهمة التسبيح الذكي
class TasbihMissionWidget extends StatefulWidget {
  final int targetCount;
  final String phrase;
  final VoidCallback onCompleted;

  const TasbihMissionWidget({
    super.key,
    required this.targetCount,
    required this.phrase,
    required this.onCompleted,
  });

  @override
  State<TasbihMissionWidget> createState() => _TasbihMissionWidgetState();
}

class _TasbihMissionWidgetState extends State<TasbihMissionWidget> {
  int _currentCount = 0;

  void _increment() {
    if (_currentCount < widget.targetCount) {
      setState(() {
        _currentCount++;
      });

      // اهتزاز خفيف عند كل ضغطة
      Vibration.vibrate(duration: 40);

      if (_currentCount >= widget.targetCount) {
        // اهتزاز احتفالي بنجاح المهمة
        Vibration.vibrate(pattern: [0, 100, 50, 150]);
        widget.onCompleted();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final progress = _currentCount / widget.targetCount;

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          decoration: BoxDecoration(
            color: AppColors.emerald.withOpacity(0.12),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppColors.emerald.withOpacity(0.3)),
          ),
          child: Text(
            widget.phrase,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: AppColors.emerald,
            ),
          ),
        ),
        const SizedBox(height: 28),
        GestureDetector(
          onTap: _increment,
          child: Container(
            width: 170,
            height: 170,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: LinearGradient(
                colors: [AppColors.emerald.shade600, Colors.teal.shade700],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              boxShadow: [
                BoxShadow(
                  color: AppColors.emerald.withOpacity(0.4),
                  blurRadius: 20,
                  spreadRadius: 4,
                ),
              ],
            ),
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    '$_currentCount / ${widget.targetCount}',
                    style: const TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'المس للتسبيح',
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.white70,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        const SizedBox(height: 20),
        ClipRRect(
          borderRadius: BorderRadius.circular(10),
          child: LinearProgressIndicator(
            value: progress,
            minHeight: 8,
            backgroundColor: Colors.white12,
            valueColor: AlwaysStoppedAnimation<Color>(AppColors.emerald.shade400),
          ),
        ),
      ],
    );
  }
}

// ويدجت مهمة الأسئلة الدينية
class QuizMissionWidget extends StatefulWidget {
  final int questionsCount;
  final VoidCallback onCompleted;

  const QuizMissionWidget({
    super.key,
    required this.questionsCount,
    required this.onCompleted,
  });

  @override
  State<QuizMissionWidget> createState() => _QuizMissionWidgetState();
}

class _QuizMissionWidgetState extends State<QuizMissionWidget> {
  late List<QuizQuestion> _questions;
  int _currentIndex = 0;
  int? _selectedAnswerIndex;
  bool _showError = false;

  @override
  void initState() {
    super.initState();
    final shuffled = List<QuizQuestion>.from(kReligiousQuestions)..shuffle();
    _questions = shuffled.take(widget.questionsCount).toList();
  }

  void _selectOption(int index) {
    final currentQ = _questions[_currentIndex];
    setState(() {
      _selectedAnswerIndex = index;
    });

    if (index == currentQ.correctIndex) {
      Vibration.vibrate(duration: 50);
      Future.delayed(const Duration(milliseconds: 600), () {
        if (_currentIndex + 1 < _questions.length) {
          setState(() {
            _currentIndex++;
            _selectedAnswerIndex = null;
            _showError = false;
          });
        } else {
          widget.onCompleted();
        }
      });
    } else {
      Vibration.vibrate(duration: 200);
      setState(() {
        _showError = true;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_questions.isEmpty) return const SizedBox.shrink();
    final q = _questions[_currentIndex];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          'سؤال ${_currentIndex + 1} من ${_questions.length}',
          style: const TextStyle(color: AppColors.emerald, fontWeight: FontWeight.bold),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 12),
        Text(
          q.question,
          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 20),
        ...List.generate(q.options.length, (idx) {
          final isSelected = _selectedAnswerIndex == idx;
          final isCorrect = idx == q.correctIndex;

          Color btnColor = Colors.white10;
          if (isSelected) {
            btnColor = isCorrect ? AppColors.emerald : Colors.red.shade700;
          }

          return Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: btnColor,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
              onPressed: () => _selectOption(idx),
              child: Text(
                q.options[idx],
                style: const TextStyle(fontSize: 16, color: Colors.white),
              ),
            ),
          );
        }),
        if (_showError)
          const Padding(
            padding: EdgeInsets.only(top: 8),
            child: Text(
              'إجابة غير صحيحة، حاول مجدداً لإيقاظ عقلك!',
              style: TextStyle(color: Colors.redAccent, fontSize: 13),
              textAlign: TextAlign.center,
            ),
          ),
      ],
    );
  }
}

// ويدجت المسائل الحسابية لإيقاظ العقل
class MathMissionWidget extends StatefulWidget {
  final int totalCount;
  final MathDifficulty difficulty;
  final VoidCallback onCompleted;

  const MathMissionWidget({
    super.key,
    required this.totalCount,
    required this.difficulty,
    required this.onCompleted,
  });

  @override
  State<MathMissionWidget> createState() => _MathMissionWidgetState();
}

class _MathMissionWidgetState extends State<MathMissionWidget> {
  int _solved = 0;
  late String _equation;
  late int _answer;
  String _input = '';
  final Random _random = Random();

  @override
  void initState() {
    super.initState();
    _generateProblem();
  }

  void _generateProblem() {
    int a, b;
    if (widget.difficulty == MathDifficulty.easy) {
      a = _random.nextInt(15) + 5;
      b = _random.nextInt(15) + 3;
      _equation = '$a + $b';
      _answer = a + b;
    } else if (widget.difficulty == MathDifficulty.medium) {
      a = _random.nextInt(30) + 12;
      b = _random.nextInt(25) + 8;
      _equation = '$a + $b';
      _answer = a + b;
    } else {
      a = _random.nextInt(9) + 4;
      b = _random.nextInt(8) + 3;
      _equation = '$a × $b';
      _answer = a * b;
    }
    _input = '';
  }

  void _checkInput() {
    if (int.tryParse(_input) == _answer) {
      Vibration.vibrate(duration: 50);
      setState(() {
        _solved++;
      });
      if (_solved >= widget.totalCount) {
        widget.onCompleted();
      } else {
        setState(() {
          _generateProblem();
        });
      }
    } else {
      Vibration.vibrate(duration: 200);
      setState(() {
        _input = '';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          'مسألة ${_solved + 1} من ${widget.totalCount}',
          style: const TextStyle(color: AppColors.emerald, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 16),
        Text(
          '$_equation = ?',
          style: const TextStyle(fontSize: 34, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 16),
        Container(
          width: 140,
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: Colors.white10,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.emerald),
          ),
          child: Text(
            _input.isEmpty ? '...' : _input,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 26, fontWeight: FontWeight.bold),
          ),
        ),
        const SizedBox(height: 20),
        // لوحة أرقام سريعة
        Wrap(
          spacing: 12,
          runSpacing: 12,
          alignment: WrapAlignment.center,
          children: [
            for (int i = 1; i <= 9; i++)
              _numKey('$i', () => setState(() => _input += '$i')),
            _numKey('C', () => setState(() => _input = ''), color: Colors.orange),
            _numKey('0', () => setState(() => _input += '0')),
            _numKey('✓', _checkInput, color: AppColors.emerald),
          ],
        ),
      ],
    );
  }

  Widget _numKey(String label, VoidCallback onTap, {Color? color}) {
    return SizedBox(
      width: 65,
      height: 52,
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          backgroundColor: color ?? Colors.white12,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          padding: EdgeInsets.zero,
        ),
        onPressed: onTap,
        child: Text(
          label,
          style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
        ),
      ),
    );
  }
}
