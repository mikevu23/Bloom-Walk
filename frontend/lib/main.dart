import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'core/theme/app_colors.dart';
import 'features/navigation/main_nav_screen.dart';

void main() {
  runApp(const BloomWalkApp());
}

class BloomWalkApp extends StatelessWidget {
  const BloomWalkApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'BloomWalk',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        scaffoldBackgroundColor: AppColors.greenBgApp,
        primaryColor: AppColors.primaryMossBtn,
        colorScheme: ColorScheme.fromSeed(
          seedColor: AppColors.primaryMossBtn,
          background: AppColors.greenBgApp,
          surface: AppColors.greenSurfaceCard,
        ),
        textTheme: GoogleFonts.plusJakartaSansTextTheme(
          Theme.of(context).textTheme,
        ).apply(
          bodyColor: AppColors.forestDarkText,
          displayColor: AppColors.forestDarkText,
        ),
        useMaterial3: true,
      ),
      home: const MainNavScreen(),
    );
  }
}
