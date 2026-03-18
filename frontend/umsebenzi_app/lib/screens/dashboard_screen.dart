import 'package:flutter/material.dart';
import '../services/api_service.dart';

class DashboardScreen extends StatefulWidget {
  final Map<String, dynamic> user;
  const DashboardScreen({super.key, required this.user});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int _currentIndex = 0;
  List<dynamic> _jobs = [];
  bool _loadingJobs = true;

  @override
  void initState() {
    super.initState();
    _loadJobs();
  }

  Future<void> _loadJobs() async {
    final result = await ApiService.getNoticeboardJobs();
    if (result['success'] == true) {
      setState(() {
        _jobs = result['jobs'];
        _loadingJobs = false;
      });
    } else {
      setState(() => _loadingJobs = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      body: _currentIndex == 0
          ? _buildHome()
          : _currentIndex == 1
          ? _buildJobs()
          : _buildProfile(),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (i) => setState(() => _currentIndex = i),
        selectedItemColor: const Color(0xFF1A6B3C),
        unselectedItemColor: Colors.grey,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home_rounded),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.work_rounded),
            label: 'Jobs',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person_rounded),
            label: 'Profile',
          ),
        ],
      ),
    );
  }

  Widget _buildHome() {
    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Hello, ${widget.user['first_name']}! 👋',
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
                        color: Color(0xFF1A1A1A),
                      ),
                    ),
                    Text(
                      widget.user['user_type'].toString().toUpperCase(),
                      style: const TextStyle(
                        fontSize: 12,
                        color: Color(0xFF1A6B3C),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: widget.user['status'] == 'approved'
                        ? Colors.green.shade50
                        : Colors.orange.shade50,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: widget.user['status'] == 'approved'
                          ? Colors.green
                          : Colors.orange,
                    ),
                  ),
                  child: Text(
                    widget.user['status'].toString().toUpperCase(),
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: widget.user['status'] == 'approved'
                          ? Colors.green.shade700
                          : Colors.orange.shade700,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            // Wallet card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF1A6B3C), Color(0xFF2D8A54)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Wallet Balance',
                    style: TextStyle(color: Colors.white70, fontSize: 14),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'R${widget.user['wallet_balance'] ?? '0.00'}',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 32,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(
                        Icons.star_rounded,
                        color: Color(0xFFF5A623),
                        size: 16,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '${widget.user['average_rating'] ?? '0.0'} Rating',
                        style: const TextStyle(
                          color: Colors.white70,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              '📌 Noticeboard',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 12),
            if (_loadingJobs)
              const Center(
                child: CircularProgressIndicator(color: Color(0xFF1A6B3C)),
              )
            else if (_jobs.isEmpty)
              Center(
                child: Column(
                  children: [
                    const SizedBox(height: 20),
                    Icon(
                      Icons.work_off_outlined,
                      size: 60,
                      color: Colors.grey.shade300,
                    ),
                    const SizedBox(height: 12),
                    const Text(
                      'No jobs posted yet',
                      style: TextStyle(color: Colors.grey),
                    ),
                  ],
                ),
              )
            else
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _jobs.length,
                itemBuilder: (context, index) {
                  final job = _jobs[index];
                  return Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.06),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Text(
                                job['title'],
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: const Color(0xFFE8F5EE),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                'R${job['pay_amount']}',
                                style: const TextStyle(
                                  color: Color(0xFF1A6B3C),
                                  fontWeight: FontWeight.w800,
                                  fontSize: 14,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          job['description'],
                          style: const TextStyle(
                            color: Colors.black54,
                            fontSize: 13,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            const Icon(
                              Icons.location_on_outlined,
                              size: 14,
                              color: Colors.grey,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              job['location'] ?? 'Location not specified',
                              style: const TextStyle(
                                color: Colors.grey,
                                fontSize: 12,
                              ),
                            ),
                            const Spacer(),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: Colors.blue.shade50,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                job['skill_category'],
                                style: TextStyle(
                                  color: Colors.blue.shade700,
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  );
                },
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildJobs() {
    return const SafeArea(
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.work_rounded, size: 80, color: Color(0xFF1A6B3C)),
            SizedBox(height: 16),
            Text(
              'My Jobs',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800),
            ),
            SizedBox(height: 8),
            Text(
              'Your active and completed jobs\nwill appear here',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProfile() {
    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            const SizedBox(height: 20),
            Container(
              width: 80,
              height: 80,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                color: Color(0xFF1A6B3C),
              ),
              child: Center(
                child: Text(
                  widget.user['first_name'][0].toUpperCase(),
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 32,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
            ),
            const SizedBox(height: 16),
            Text(
              '${widget.user['first_name']} ${widget.user['last_name']}',
              style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800),
            ),
            Text(
              '@${widget.user['username']}',
              style: const TextStyle(color: Colors.grey),
            ),
            const SizedBox(height: 24),
            _profileItem(Icons.email_outlined, 'Email', widget.user['email']),
            _profileItem(Icons.phone_outlined, 'Phone', widget.user['phone']),
            _profileItem(
              Icons.work_outline,
              'Account Type',
              widget.user['user_type'].toString().toUpperCase(),
            ),
            _profileItem(
              Icons.verified_user_outlined,
              'Status',
              widget.user['status'].toString().toUpperCase(),
            ),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              height: 52,
              child: OutlinedButton(
                onPressed: () async {
                  await ApiService.logout();
                  if (mounted)
                    Navigator.of(context).popUntil((route) => route.isFirst);
                },
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: Colors.red),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
                child: const Text(
                  'LOG OUT',
                  style: TextStyle(
                    color: Colors.red,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _profileItem(IconData icon, String label, String value) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Icon(icon, color: const Color(0xFF1A6B3C), size: 20),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: const TextStyle(fontSize: 11, color: Colors.grey),
              ),
              Text(
                value,
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
