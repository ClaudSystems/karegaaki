import 'package:flutter/material.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('KaregaAki'),
        actions: [
          IconButton(
            icon: const Icon(Icons.account_circle),
            onPressed: () {},
          ),
        ],
      ),
      body: const Center(
        child: Text(
          'Bem-vindo ao KaregaAki! 🎉',
          style: TextStyle(fontSize: 20),
        ),
      ),
    );
  }
}