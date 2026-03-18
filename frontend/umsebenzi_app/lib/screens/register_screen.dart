import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'login_screen.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _firstNameCtrl = TextEditingController();
  final _lastNameCtrl = TextEditingController();
  final _usernameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _idCtrl = TextEditingController();
  String _userType = 'worker';
  String _gender = 'male';
  bool _isLoading = false;
  String? _errorMessage;
  bool _obscurePassword = true;

  Future<void> _register() async {
    if (_firstNameCtrl.text.isEmpty ||
        _lastNameCtrl.text.isEmpty ||
        _usernameCtrl.text.isEmpty ||
        _emailCtrl.text.isEmpty ||
        _phoneCtrl.text.isEmpty ||
        _passwordCtrl.text.isEmpty) {
      setState(() => _errorMessage = 'Please fill in all required fields');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final result = await ApiService.register(
      username: _usernameCtrl.text.trim(),
      email: _emailCtrl.text.trim(),
      phone: _phoneCtrl.text.trim(),
      password: _passwordCtrl.text,
      userType: _userType,
      firstName: _firstNameCtrl.text.trim(),
      lastName: _lastNameCtrl.text.trim(),
      idNumber: _idCtrl.text.trim(),
      gender: _gender,
      nationality: 'South African',
    );

    setState(() => _isLoading = false);

    if (result['success'] == true) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              '🎉 Registration successful! Your account is under review.',
            ),
            backgroundColor: Color(0xFF1A6B3C),
          ),
        );
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const LoginScreen()),
        );
      }
    } else {
      setState(() => _errorMessage = result['message']);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF1A6B3C)),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Create Account',
          style: TextStyle(
            color: Color(0xFF1A1A1A),
            fontWeight: FontWeight.w800,
          ),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 28),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 20),
              if (_errorMessage != null)
                Container(
                  padding: const EdgeInsets.all(12),
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: Colors.red.shade50,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.red.shade200),
                  ),
                  child: Text(
                    _errorMessage!,
                    style: TextStyle(color: Colors.red.shade600),
                  ),
                ),
              // Account Type
              const Text(
                'Account Type',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  _typeChip('worker', '👷 Worker'),
                  const SizedBox(width: 8),
                  _typeChip('client', '🏠 Client'),
                  const SizedBox(width: 8),
                  _typeChip('company', '🏢 Company'),
                ],
              ),
              const SizedBox(height: 20),
              _buildLabel('First Name'),
              const SizedBox(height: 8),
              _buildField(
                _firstNameCtrl,
                'Enter first name',
                Icons.person_outline,
              ),
              const SizedBox(height: 16),
              _buildLabel('Last Name'),
              const SizedBox(height: 8),
              _buildField(
                _lastNameCtrl,
                'Enter last name',
                Icons.person_outline,
              ),
              const SizedBox(height: 16),
              _buildLabel('Username'),
              const SizedBox(height: 8),
              _buildField(
                _usernameCtrl,
                'Choose a username',
                Icons.alternate_email,
              ),
              const SizedBox(height: 16),
              _buildLabel('Email Address'),
              const SizedBox(height: 8),
              _buildField(
                _emailCtrl,
                'Enter your email',
                Icons.email_outlined,
                keyboardType: TextInputType.emailAddress,
              ),
              const SizedBox(height: 16),
              _buildLabel('Phone Number'),
              const SizedBox(height: 8),
              _buildField(
                _phoneCtrl,
                'Enter your phone number',
                Icons.phone_outlined,
                keyboardType: TextInputType.phone,
              ),
              const SizedBox(height: 16),
              _buildLabel('SA ID Number'),
              const SizedBox(height: 8),
              _buildField(
                _idCtrl,
                'Enter your ID number',
                Icons.badge_outlined,
              ),
              const SizedBox(height: 16),
              _buildLabel('Gender'),
              const SizedBox(height: 8),
              Row(
                children: [
                  _genderChip('male', '👨 Male'),
                  const SizedBox(width: 8),
                  _genderChip('female', '👩 Female'),
                  const SizedBox(width: 8),
                  _genderChip('other', '🧑 Other'),
                ],
              ),
              const SizedBox(height: 16),
              _buildLabel('Password'),
              const SizedBox(height: 8),
              _buildField(
                _passwordCtrl,
                'Create a strong password',
                Icons.lock_outline,
                isPassword: true,
              ),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _register,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF1A6B3C),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    elevation: 0,
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2.5,
                          ),
                        )
                      : const Text(
                          'CREATE ACCOUNT',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 1,
                          ),
                        ),
                ),
              ),
              const SizedBox(height: 24),
              Center(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text(
                      'Already have an account? ',
                      style: TextStyle(color: Colors.black54),
                    ),
                    GestureDetector(
                      onTap: () => Navigator.of(context).pushReplacement(
                        MaterialPageRoute(builder: (_) => const LoginScreen()),
                      ),
                      child: const Text(
                        'Login',
                        style: TextStyle(
                          color: Color(0xFF1A6B3C),
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }

  Widget _typeChip(String value, String label) {
    final selected = _userType == value;
    return GestureDetector(
      onTap: () => setState(() => _userType = value),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: selected ? const Color(0xFF1A6B3C) : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: selected ? const Color(0xFF1A6B3C) : Colors.grey.shade300,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: selected ? Colors.white : Colors.black54,
            fontSize: 13,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }

  Widget _genderChip(String value, String label) {
    final selected = _gender == value;
    return GestureDetector(
      onTap: () => setState(() => _gender = value),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: selected ? const Color(0xFF1A6B3C) : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: selected ? const Color(0xFF1A6B3C) : Colors.grey.shade300,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: selected ? Colors.white : Colors.black54,
            fontSize: 13,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }

  Widget _buildLabel(String text) => Text(
    text,
    style: const TextStyle(
      fontSize: 14,
      fontWeight: FontWeight.w600,
      color: Color(0xFF1A1A1A),
    ),
  );

  Widget _buildField(
    TextEditingController ctrl,
    String hint,
    IconData icon, {
    bool isPassword = false,
    TextInputType? keyboardType,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.06),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: TextField(
        controller: ctrl,
        obscureText: isPassword ? _obscurePassword : false,
        keyboardType: keyboardType,
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: const TextStyle(color: Colors.black38, fontSize: 14),
          prefixIcon: Icon(icon, color: const Color(0xFF1A6B3C), size: 22),
          suffixIcon: isPassword
              ? IconButton(
                  icon: Icon(
                    _obscurePassword
                        ? Icons.visibility_off_outlined
                        : Icons.visibility_outlined,
                    color: Colors.black38,
                    size: 20,
                  ),
                  onPressed: () =>
                      setState(() => _obscurePassword = !_obscurePassword),
                )
              : null,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: BorderSide.none,
          ),
          filled: true,
          fillColor: Colors.white,
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 16,
            vertical: 16,
          ),
        ),
      ),
    );
  }
}
