class MapMarkerItem {
  final String id;
  final String flowerId;
  final String name;
  final String species;
  final String rarity;
  final String meaning;
  final String spriteUrl;
  final double latitude;
  final double longitude;
  final String? placeName;
  final bool isCollected;
  final bool canCollect;
  final int minStepsRequired;

  MapMarkerItem({
    required this.id,
    required this.flowerId,
    required this.name,
    required this.species,
    required this.rarity,
    required this.meaning,
    required this.spriteUrl,
    required this.latitude,
    required this.longitude,
    this.placeName,
    required this.isCollected,
    required this.canCollect,
    required this.minStepsRequired,
  });

  factory MapMarkerItem.fromJson(Map<String, dynamic> json) {
    return MapMarkerItem(
      id: json['id'] as String,
      flowerId: json['flower_id'] as String,
      name: json['name'] as String,
      species: json['species'] as String,
      rarity: json['rarity'] as String,
      meaning: json['meaning'] as String,
      spriteUrl: json['sprite_url'] as String,
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      placeName: json['place_name'] as String?,
      isCollected: json['is_collected'] as bool? ?? false,
      canCollect: json['can_collect'] as bool? ?? false,
      minStepsRequired: json['min_steps_required'] as int? ?? 0,
    );
  }
}
