import 'package:flutter/material.dart';
import '../../core/api/api_client.dart';
import '../../core/theme/app_colors.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  Map<String, dynamic>? _dashboardData;
  List<dynamic> _gardenBouquets = [];
  List<dynamic> _crisisContacts = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadAllData();
  }

  Future<void> _loadAllData() async {
    try {
      final homeData = await ApiClient.getHome();
      final gardenData = await ApiClient.getGarden();
      final resourcesData = await ApiClient.getResources();
      setState(() {
        _dashboardData = homeData;
        _gardenBouquets = gardenData;
        _crisisContacts = resourcesData['contacts'] as List<dynamic>? ?? [
          {'title': '988 Suicide & Crisis Lifeline', 'summary': 'Free, confidential 24/7 support', 'contact_number': '988'},
          {'title': 'Crisis Text Line', 'summary': 'Text HOME for 24/7 support', 'contact_number': '741741'}
        ];
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  String _formatDate(String isoDate) {
    try {
      final parts = isoDate.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      final month = monthNames[int.parse(parts[1]) - 1];
      final day = int.parse(parts[2]);
      return '$month $day';
    } catch (_) {
      return 'Nov 5';
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator(color: AppColors.sagePrimary));
    }

    final rawDate = _dashboardData?['date'] ?? '2026-11-05';
    final date = _formatDate(rawDate);
    final fotd = _dashboardData?['flower_of_the_day'];
    final quote = _dashboardData?['motivational_quote'];
    final steps = _dashboardData?['today_bouquet']?['total_steps'] ?? 0;

    // Flatten all collected flowers for the checkerboard plot
    final List<dynamic> allCollected = [];
    for (final b in _gardenBouquets) {
      final flowers = b['flowers'] as List<dynamic>? ?? [];
      allCollected.addAll(flowers);
    }

    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        children: [
          // Header Row: App Title "🌸 Bloom walk" on left, Date next to Temp & Steps on right
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                '🌸 Bloom walk',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.forestDark),
              ),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.linenSurface,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.borderWood),
                    ),
                    child: Text(date, style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w600, color: AppColors.forestDark)),
                  ),
                  const SizedBox(width: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.linenSurface,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.borderWood),
                    ),
                    child: const Text('☀️ 72°F', style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w600)),
                  ),
                  const SizedBox(width: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.linenSurface,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.borderWood),
                    ),
                    child: Text('👟 $steps', style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w600)),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 14),

          // 1. FLOWER OF THE DAY (Top)
          if (fotd != null)
            Card(
              color: AppColors.linenSurface,
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
                side: const BorderSide(color: AppColors.borderWood),
              ),
              child: Padding(
                padding: const EdgeInsets.all(14),
                children: [
                  const Text('FLOWER OF THE DAY', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: AppColors.sunflowerAccent)),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Container(
                        width: 52,
                        height: 52,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.borderWood),
                        ),
                        child: const Center(child: Text('🌻', style: TextStyle(fontSize: 26))),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(fotd['name'] ?? '', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.forestDark)),
                            Text(fotd['species'] ?? '', style: const TextStyle(fontSize: 11, fontStyle: FontStyle.italic, color: AppColors.textMuted)),
                            const SizedBox(height: 2),
                            Text('"${fotd['meaning'] ?? ''}"', style: const TextStyle(fontSize: 11.5)),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          const SizedBox(height: 14),

          // 2. "MY LITTLE GARDEN" CHECKERBOARD PLOT (Centerpiece)
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFFE3EDE0),
              borderRadius: BorderRadius.circular(22),
              border: Border.all(color: const Color(0xFFD2E0CE)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('My little garden', style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: AppColors.forestDark)),
                    Text('${allCollected.length} blooms collected', style: const TextStyle(fontSize: 12, color: Color(0xFF557252), fontWeight: FontWeight.w600)),
                  ],
                ),
                const SizedBox(height: 12),
                
                // 6x4 Checkerboard Grid
                ClipRRect(
                  borderRadius: BorderRadius.circular(14),
                  child: Container(
                    color: const Color(0xFFB4C9AF),
                    padding: const EdgeInsets.all(1.5),
                    child: GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 6,
                        crossAxisSpacing: 1.5,
                        mainAxisSpacing: 1.5,
                      ),
                      itemCount: 24,
                      itemBuilder: (context, index) {
                        final row = index ~/ 6;
                        final col = index % 6;
                        final isLight = (row + col) % 2 === 0;
                        final tileColor = isLight ? const Color(0xFFCADCC5) : const Color(0xFFBDD1B8);

                        String content = '';
                        if (index < allCollected.length) {
                          content = '🌸';
                        } else if ([4, 6, 11, 14, 18, 20].contains(index)) {
                          content = '🌱';
                        }

                        return Container(
                          color: tileColor,
                          alignment: Alignment.center,
                          child: Text(content, style: TextStyle(fontSize: content == '🌱' ? 12 : 20)),
                        );
                      },
                    ),
                  ),
                ),
                const SizedBox(height: 10),
                const Row(
                  children: [
                    Text('🌱', style: TextStyle(fontSize: 13)),
                    SizedBox(width: 6),
                    Text('Your pocket of spring', style: TextStyle(fontSize: 12, color: Color(0xFF446344), fontWeight: FontWeight.w500)),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),

          // 3. MOTIVATIONAL QUOTE OF THE DAY (Underneath Garden)
          if (quote != null)
            Card(
              color: AppColors.linenSurface,
              elevation: 0,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
                side: const BorderSide(color: AppColors.borderWood),
              ),
              child: Padding(
                padding: const EdgeInsets.all(14),
                children: [
                  Text('“${quote['quote']}”', style: const TextStyle(fontSize: 13, fontStyle: FontStyle.italic)),
                  const SizedBox(height: 4),
                  Align(
                    alignment: Alignment.centerRight,
                    child: Text('— ${quote['author']}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.textMuted)),
                  ),
                ],
              ),
            ),
          const SizedBox(height: 14),

          // 4. CRISIS & SUPPORT CONTACTS ONLY (Direct Contacts, No Suggestions)
          Row(
            children: const [
              Text('💙', style: TextStyle(fontSize: 12)),
              SizedBox(width: 6),
              Text('Support & Crisis Contacts', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold, color: AppColors.forestDark)),
            ],
          ),
          const SizedBox(height: 8),

          ..._crisisContacts.map((c) => Container(
            margin: const EdgeInsets.only(bottom: 8),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: AppColors.linenSurface,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.borderWood),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(c['title'], style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.forestDark)),
                    const SizedBox(height: 2),
                    Text(c['summary'], style: const TextStyle(fontSize: 10.5, color: AppColors.textMuted)),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: const Color(0xFF2563EB),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    c['contact_number'] == '741741' ? 'Text 741741' : 'Call/Text ${c['contact_number']}',
                    style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
          )),
        ],
      ),
    );
  }
}
