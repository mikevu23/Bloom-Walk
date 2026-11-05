import 'package:flutter/material.dart';
import '../../core/api/api_client.dart';
import '../../core/theme/app_colors.dart';
import '../../models/daily_bouquet.dart';

class GardenScreen extends StatefulWidget {
  const GardenScreen({super.key});

  @override
  State<GardenScreen> createState() => _GardenScreenState();
}

class _GardenScreenState extends State<GardenScreen> {
  final Map<String, DailyBouquet> _bouquetsByDate = {};
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadGardenData();
  }

  Future<void> _loadGardenData() async {
    try {
      final list = await ApiClient.getGarden();
      setState(() {
        for (final item in list) {
          final b = DailyBouquet.fromJson(item as Map<String, dynamic>);
          _bouquetsByDate[b.bouquetDate] = b;
        }
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator(color: AppColors.primaryMossBtn));
    }

    // Scrollable chronicle list of monthly calendars
    final months = [
      {'year': 2026, 'month': 11, 'title': 'November 2026'},
      {'year': 2026, 'month': 10, 'title': 'October 2026'},
    ];

    return Scaffold(
      backgroundColor: AppColors.greenBgApp,
      appBar: AppBar(
        title: const Text('Garden Calendars', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.forestDarkText)),
        backgroundColor: const Color(0xFFDCEAD8),
        elevation: 0,
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: months.length,
        itemBuilder: (context, index) {
          final m = months[index];
          return _buildMonthCalendarCard(m['year'] as int, m['month'] as int, m['title'] as String);
        },
      ),
    );
  }

  Widget _buildMonthCalendarCard(int year, int month, String title) {
    final firstDay = DateTime(year, month, 1);
    final daysInMonth = DateTime(year, month + 1, 0).day;
    int startPadding = firstDay.weekday - 1; // Mon = 0

    int totalBlooms = 0;
    int totalSteps = 0;

    for (int d = 1; d <= daysInMonth; d++) {
      final dateKey = '$year-${month.toString().padLeft(2, '0')}-${d.toString().padLeft(2, '0')}';
      final b = _bouquetsByDate[dateKey];
      if (b != null) {
        totalBlooms += b.flowerCount;
        totalSteps += b.totalSteps;
      }
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 18),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.greenSurfaceCard,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.greenBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Month Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.forestDarkText)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppColors.greenSurfaceSubtle,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppColors.greenBorder),
                ),
                child: Text('$totalBlooms blooms • 👟 $totalSteps steps', style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: AppColors.primaryMossBtn)),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Weekdays row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((w) => Text(
              w, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.forestMutedText),
            )).toList(),
          ),
          const SizedBox(height: 8),

          // Days Grid
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 7,
              crossAxisSpacing: 3,
              mainAxisSpacing: 3,
              childAspectRatio: 0.85,
            ),
            itemCount: startPadding + daysInMonth,
            itemBuilder: (context, index) {
              if (index < startPadding) {
                return const SizedBox.shrink();
              }
              final day = index - startPadding + 1;
              final dateKey = '$year-${month.toString().padLeft(2, '0')}-${day.toString().padLeft(2, '0')}';
              final bouquet = _bouquetsByDate[dateKey];
              final hasBlooms = bouquet != null && bouquet.flowers.isNotEmpty;

              return Container(
                decoration: BoxDecoration(
                  color: hasBlooms ? AppColors.gardenPlotBg : AppColors.greenSurfaceSubtle,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: hasBlooms ? AppColors.primaryMossBtn : AppColors.greenBorder),
                ),
                padding: const EdgeInsets.all(2),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Align(
                      alignment: Alignment.topLeft,
                      child: Text('$day', style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: AppColors.forestDarkText)),
                    ),
                    if (hasBlooms)
                      const Text('🌸', style: TextStyle(fontSize: 12))
                    else
                      const SizedBox.shrink(),
                    const SizedBox(height: 1),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}
