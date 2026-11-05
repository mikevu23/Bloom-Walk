import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiClient {
  // Use localhost for iOS simulator / web, 10.0.2.2 for Android emulator
  static const String baseUrl = 'http://localhost:3000/api';

  static Future<Map<String, dynamic>> getHome() async {
    final response = await http.get(Uri.parse('$baseUrl/home'));
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw Exception('Failed to load home dashboard');
  }

  static Future<List<dynamic>> getFlowers() async {
    final response = await http.get(Uri.parse('$baseUrl/flowers'));
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw Exception('Failed to load flowers');
  }

  static Future<Map<String, dynamic>> getMapMarkers({int steps = 0, String weather = 'sunny'}) async {
    final response = await http.get(Uri.parse('$baseUrl/map/flowers?steps=$steps&weather=$weather'));
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw Exception('Failed to load map markers');
  }

  static Future<Map<String, dynamic>> collectFlower({
    required String flowerId,
    required double lat,
    required double lng,
    required String mood,
    required String weather,
    required int steps,
    String? journalNote,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/collection'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'flowerId': flowerId,
        'lat': lat,
        'lng': lng,
        'mood': mood,
        'weather': weather,
        'steps': steps,
        'journalNote': journalNote ?? '',
      }),
    );
    if (response.statusCode == 201) {
      return jsonDecode(response.body);
    }
    throw Exception('Failed to record flower collection');
  }

  static Future<List<dynamic>> getGarden() async {
    final response = await http.get(Uri.parse('$baseUrl/garden'));
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw Exception('Failed to load garden bouquets');
  }

  static Future<Map<String, dynamic>> getResources() async {
    final response = await http.get(Uri.parse('$baseUrl/resources'));
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw Exception('Failed to load therapy resources');
  }
}
