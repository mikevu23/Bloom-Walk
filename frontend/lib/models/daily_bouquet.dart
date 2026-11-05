class DailyBouquet {
  final String bouquetDate;
  final String bouquetTitle;
  final int totalSteps;
  final bool stepGoalMet;
  final int flowerCount;
  final String? dominantMood;
  final String? dominantWeather;
  final String? dayJournal;
  final List<dynamic> flowers;

  DailyBouquet({
    required this.bouquetDate,
    required this.bouquetTitle,
    required this.totalSteps,
    required this.stepGoalMet,
    required this.flowerCount,
    this.dominantMood,
    this.dominantWeather,
    this.dayJournal,
    this.flowers = const [],
  });

  factory DailyBouquet.fromJson(Map<String, dynamic> json) {
    return DailyBouquet(
      bouquetDate: json['bouquet_date'] as String,
      bouquetTitle: json['bouquet_title'] as String? ?? 'Daily Bouquet',
      totalSteps: json['total_steps'] as int? ?? 0,
      stepGoalMet: (json['step_goal_met'] as int? ?? 0) == 1,
      flowerCount: json['flower_count'] as int? ?? 0,
      dominantMood: json['dominant_mood'] as String?,
      dominantWeather: json['dominant_weather'] as String?,
      dayJournal: json['day_journal'] as String?,
      flowers: json['flowers'] as List<dynamic>? ?? [],
    );
  }
}
