import 'package:flutter/material.dart';
import 'features/auth/screens/login_screen.dart';
import 'features/home/screens/home_screen.dart';
import 'core/theme/app_theme.dart';

class KaregaAkiApp extends StatelessWidget {
  const KaregaAkiApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'KaregaAki',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: const LoginScreen(),
    );
  }
}