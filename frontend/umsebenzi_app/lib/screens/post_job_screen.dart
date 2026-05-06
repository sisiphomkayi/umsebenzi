import 'package:flutter/material.dart';
import '../services/api_service.dart';

class PostJobScreen extends StatefulWidget {
  const PostJobScreen({super.key});

  @override
  State<PostJobScreen> createState() => _PostJobScreenState();
}

class _PostJobScreenState extends State<PostJobScreen> {
  final _titleCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _locationCtrl = TextEditingController();
  final _payCtrl = TextEditingController();
  String _skillCategory = 'General';
  bool _isLoading = false;
  String? _errorMessage;

  final List<String> _skills = [
    'General', 'Electrical', 'Plumbing', 'Cleaning',
    'Gardening', 'Painting', 'Construction', 'Driving',
    'Security', 'Catering', 'IT', 'Other'
  ];

  Future<void> _postJob() async {
    if (_titleCtrl.text.isEmpty || _descCtrl.text.isEmpty ||
        _locationCtrl.text.isEmpty || _payCtrl.text.isEmpty) {
      setState(() => _errorMessage = 'Please fill in all fields');
      return;
    }
    setState(() { _isLoading = true; _errorMessage = null; });
    final result = await ApiService.postJob(
      title: _titleCtrl.text.trim(),
      description: _descCtrl.text.trim(),
      skillCategory: _skillCategory,
      payAmount: double.tryParse(_payCtrl.text) ?? 0,
      location: _locationCtrl.text.trim(),
      isNoticeboard: true,
    );
    setState(() => _isLoading = false);
    if (result['success'] == true) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Job posted successfully!'), backgroundColor: Color(0xFF1A6B3C)),
        );
        Navigator.pop(context, true);
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
        backgroundColor: const Color(0xFF1A6B3C),
        foregroundColor: Colors.white,
        title: const Text('Post a Job', style: TextStyle(fontWeight: FontWeight.w800)),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (_errorMessage != null)
              Container(
                padding: const EdgeInsets.all(12),
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(color: Colors.red.shade50, borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.red.shade200)),
                child: Text(_errorMessage!, style: TextStyle(color: Colors.red.shade600)),
              ),
            _label('Job Title'),
            const SizedBox(height: 8),
            _field(_titleCtrl, 'e.g. Electrician Needed in Soweto', Icons.work_outline),
            const SizedBox(height: 16),
            _label('Description'),
            const SizedBox(height: 8),
            Container(
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14),
                boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 10, offset: const Offset(0, 4))]),
              child: TextField(
                controller: _descCtrl,
                maxLines: 4,
                decoration: InputDecoration(
                  hintText: 'Describe what you need done...',
                  hintStyle: const TextStyle(color: Colors.black38, fontSize: 14),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                  filled: true, fillColor: Colors.white,
                  contentPadding: const EdgeInsets.all(16),
                ),
              ),
            ),
            const SizedBox(height: 16),
            _label('Skill Category'),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14),
                boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 10, offset: const Offset(0, 4))]),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: _skillCategory,
                  isExpanded: true,
                  items: _skills.map((s) => DropdownMenuItem(value: s, child: Text(s))).toList(),
                  onChanged: (v) => setState(() => _skillCategory = v!),
                ),
              ),
            ),
            const SizedBox(height: 16),
            _label('Location'),
            const SizedBox(height: 8),
            _field(_locationCtrl, 'e.g. Soweto, Johannesburg', Icons.location_on_outlined),
            const SizedBox(height: 16),
            _label('Pay Amount (R)'),
            const SizedBox(height: 8),
            _field(_payCtrl, 'e.g. 850', Icons.attach_money, keyboardType: TextInputType.number),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity, height: 56,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _postJob,
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF1A6B3C), foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)), elevation: 0),
                child: _isLoading
                    ? const CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5)
                    : const Text('POST JOB', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, letterSpacing: 2)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _label(String text) => Text(text, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600));

  Widget _field(TextEditingController ctrl, String hint, IconData icon, {TextInputType? keyboardType}) {
    return Container(
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 10, offset: const Offset(0, 4))]),
      child: TextField(
        controller: ctrl, keyboardType: keyboardType,
        decoration: InputDecoration(
          hintText: hint, hintStyle: const TextStyle(color: Colors.black38, fontSize: 14),
          prefixIcon: Icon(icon, color: const Color(0xFF1A6B3C), size: 22),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
          filled: true, fillColor: Colors.white,
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        ),
      ),
    );
  }
}
