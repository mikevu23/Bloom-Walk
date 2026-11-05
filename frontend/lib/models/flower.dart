class Flower {
  final String id;
  final String name;
  final String species;
  final String rarity;
  final String meaning;
  final String spriteUrl;
  final String requiredWeather;
  final int minStepsRequired;
  final bool isDiscovered;

  Flower({
    required this.id,
    required this.name,
    required this.species,
    required this.rarity,
    required this.meaning,
    required this.spriteUrl,
    required this.requiredWeather,
    required this.minStepsRequired,
    this.isDiscovered = false,
  });

  factory Flower.fromJson(Map<String, dynamic> json) {
    return Flower(
      id: json['id'] as String,
      name: json['name'] as String,
      species: json['species'] as String,
      rarity: json['rarity'] as String,
      meaning: json['meaning'] as String,
      spriteUrl: json['sprite_url'] as String,
      requiredWeather: json['required_weather'] as String? ?? 'any',
      minStepsRequired: json['min_steps_required'] as int? ?? 0,
      isDiscovered: json['is_discovered'] as bool? ?? false,
    );
  }
}
