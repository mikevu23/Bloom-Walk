import 'package:flutter/material.dart';
import '../../core/api/api_client.dart';
import '../../core/theme/app_colors.dart';
import '../../models/map_marker.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  List<MapMarkerItem> _markers = [];
  MapMarkerItem? _selectedMarker;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadMarkers();
  }

  Future<void> _loadMarkers() async {
    try {
      final res = await ApiClient.getMapMarkers(steps: 1250, weather: 'sunny');
      final list = (res['markers'] as List<dynamic>)
          .map((m) => MapMarkerItem.fromJson(m as Map<String, dynamic>))
          .toList();
      setState(() {
        _markers = list;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  void _openRightDrawer(MapMarkerItem marker) {
    setState(() {
      _selectedMarker = marker;
    });
    _scaffoldKey.currentState?.openEndDrawer();
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator(color: AppColors.primaryMossBtn));
    }

    return Scaffold(
      key: _scaffoldKey,
      appBar: AppBar(
        title: const Text('🌸 Bloom walk Map (Vancouver, BC)', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.forestDarkText)),
        backgroundColor: const Color(0xFFDCEAD8),
        elevation: 0,
      ),
      // Sliding Drawer on the Right
      endDrawer: _selectedMarker == null
          ? null
          : Drawer(
              backgroundColor: AppColors.greenBgApp,
              width: MediaQuery.of(context).size.width * 0.85,
              child: SafeArea(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      // Header has the Flower Name as requested
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              '🌸 ${_selectedMarker!.name}',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.forestDarkText),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.close, color: AppColors.forestMutedText),
                            onPressed: () => Navigator.of(context).pop(),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),

                      // Floating sprite without square outline
                      const Text('🌸', style: TextStyle(fontSize: 52)),
                      const SizedBox(height: 6),

                      Text(_selectedMarker!.species, style: const TextStyle(fontSize: 12, fontStyle: FontStyle.italic, color: AppColors.forestMutedText)),
                      const SizedBox(height: 8),

                      // Location & Rarity Tags
                      Wrap(
                        spacing: 6,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppColors.greenSurfaceCard,
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: AppColors.greenBorder),
                            ),
                            child: Text('📍 ${_selectedMarker!.placeName ?? 'Vancouver, BC'}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.forestDarkText)),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFDE68A),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(_selectedMarker!.rarity.toUpperCase(), style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF92400E))),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),

                      // Weather-dependent adaptation card
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.greenSurfaceCard,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: AppColors.greenBorder),
                        ),
                        child: const Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('☀️ WEATHER ADAPTATION', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.primaryMossBtn)),
                            SizedBox(height: 3),
                            Text('Basking in Vancouver\'s coastal sun, petals are fully open and radiant. In rain, petals droop with glistening dewdrops.', style: TextStyle(fontSize: 11.5)),
                          ],
                        ),
                      ),
                      const SizedBox(height: 8),

                      // Floriography Lore
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.greenSurfaceCard,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: AppColors.greenBorder),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('FLORIOGRAPHY LORE', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.primaryMossBtn)),
                            const SizedBox(height: 3),
                            Text('"${_selectedMarker!.meaning}"', style: const TextStyle(fontSize: 11.5, fontStyle: FontStyle.italic)),
                          ],
                        ),
                      ),

                      const Spacer(),

                      // Action button (reflection note removed)
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primaryMossBtn,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          onPressed: _selectedMarker!.isCollected ? null : () => _collectFlower(_selectedMarker!),
                          child: Text(
                            _selectedMarker!.isCollected ? 'Already in Your Garden ✓' : 'Pick & Plant in Garden',
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
      body: Container(
        color: const Color(0xFFD2E3CE),
        child: ListView.separated(
          padding: const EdgeInsets.all(16),
          itemCount: _markers.length,
          separatorBuilder: (_, __) => const SizedBox(height: 10),
          itemBuilder: (context, index) {
            final marker = _markers[index];
            return ListTile(
              tileColor: AppColors.greenSurfaceCard,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
                side: BorderSide(
                  color: marker.isCollected ? AppColors.sunflowerAccent : AppColors.greenBorder,
                  width: marker.isCollected ? 2 : 1,
                ),
              ),
              leading: const Text('🌸', style: TextStyle(fontSize: 28)),
              title: Text(marker.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.forestDarkText)),
              subtitle: Text('${marker.placeName ?? 'Vancouver'} • ${marker.meaning}', style: const TextStyle(fontSize: 11.5, color: AppColors.forestMutedText)),
              trailing: const Icon(Icons.arrow_forward_ios, size: 14, color: AppColors.forestMutedText),
              onTap: () => _openRightDrawer(marker),
            );
          },
        ),
      ),
    );
  }

  void _collectFlower(MapMarkerItem marker) async {
    Navigator.of(context).pop();
    await ApiClient.collectFlower(
      flowerId: marker.flowerId,
      lat: marker.latitude,
      lng: marker.longitude,
      mood: 'Peaceful',
      weather: 'Sunny',
      steps: 1250,
      journalNote: '',
    );
    _loadMarkers();
  }
}
