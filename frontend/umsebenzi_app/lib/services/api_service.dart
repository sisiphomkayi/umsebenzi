import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static const String baseUrl = 'http://localhost:5000/api';
  // ─── GET TOKEN ───────────────────────────────────────────────
  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  // ─── SAVE TOKEN ──────────────────────────────────────────────
  static Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('token', token);
  }

  // ─── SAVE USER ───────────────────────────────────────────────
  static Future<void> saveUser(Map<String, dynamic> user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('user', jsonEncode(user));
  }

  // ─── GET USER ────────────────────────────────────────────────
  static Future<Map<String, dynamic>?> getUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userStr = prefs.getString('user');
    if (userStr == null) return null;
    return jsonDecode(userStr);
  }

  // ─── LOGOUT ──────────────────────────────────────────────────
  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('user');
  }

  // ─── HEADERS ─────────────────────────────────────────────────
  static Future<Map<String, String>> getHeaders() async {
    final token = await getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  // ─── REGISTER ────────────────────────────────────────────────
  static Future<Map<String, dynamic>> register({
    required String username,
    required String email,
    required String phone,
    required String password,
    required String userType,
    required String firstName,
    required String lastName,
    String? idNumber,
    String? gender,
    String? nationality,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/register'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'username': username,
          'email': email,
          'phone': phone,
          'password': password,
          'user_type': userType,
          'first_name': firstName,
          'last_name': lastName,
          'id_number': idNumber,
          'gender': gender,
          'nationality': nationality,
        }),
      );
      return jsonDecode(response.body);
    } catch (e) {
      return {'success': false, 'message': 'Connection error: $e'};
    }
  }

  // ─── LOGIN ────────────────────────────────────────────────────
  static Future<Map<String, dynamic>> login({
    required String username,
    required String password,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'username': username, 'password': password}),
      );
      final data = jsonDecode(response.body);
      if (data['success'] == true) {
        await saveToken(data['token']);
        await saveUser(data['user']);
      }
      return data;
    } catch (e) {
      return {'success': false, 'message': 'Connection error: $e'};
    }
  }

  // ─── GET NOTICEBOARD JOBS ─────────────────────────────────────
  static Future<Map<String, dynamic>> getNoticeboardJobs() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/jobs/noticeboard'),
        headers: await getHeaders(),
      );
      return jsonDecode(response.body);
    } catch (e) {
      return {'success': false, 'message': 'Connection error: $e'};
    }
  }

  // ─── GET NEARBY WORKERS ───────────────────────────────────────
  static Future<Map<String, dynamic>> getNearbyWorkers({
    String? skillCategory,
  }) async {
    try {
      String url = '$baseUrl/jobs/workers/nearby';
      if (skillCategory != null) url += '?skill_category=$skillCategory';
      final response = await http.get(
        Uri.parse(url),
        headers: await getHeaders(),
      );
      return jsonDecode(response.body);
    } catch (e) {
      return {'success': false, 'message': 'Connection error: $e'};
    }
  }

  // ─── GET MY JOB REQUESTS ──────────────────────────────────────
  static Future<Map<String, dynamic>> getMyJobRequests() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/jobs/my-requests'),
        headers: await getHeaders(),
      );
      return jsonDecode(response.body);
    } catch (e) {
      return {'success': false, 'message': 'Connection error: $e'};
    }
  }

  // ─── GET NOTIFICATIONS ────────────────────────────────────────
  static Future<Map<String, dynamic>> getNotifications() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/notifications'),
        headers: await getHeaders(),
      );
      return jsonDecode(response.body);
    } catch (e) {
      return {'success': false, 'message': 'Connection error: $e'};
    }
  }

  // ─── GET WALLET BALANCE ───────────────────────────────────────
  static Future<Map<String, dynamic>> getWalletBalance() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/wallet/balance'),
        headers: await getHeaders(),
      );
      return jsonDecode(response.body);
    } catch (e) {
      return {'success': false, 'message': 'Connection error: $e'};
    }
  }

  // ─── SEND MESSAGE ─────────────────────────────────────────────
  static Future<Map<String, dynamic>> sendMessage({
    required String jobRequestId,
    required String receiverId,
    required String content,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/chat/send'),
        headers: await getHeaders(),
        body: jsonEncode({
          'job_request_id': jobRequestId,
          'receiver_id': receiverId,
          'content': content,
        }),
      );
      return jsonDecode(response.body);
    } catch (e) {
      return {'success': false, 'message': 'Connection error: $e'};
    }
  }
}
