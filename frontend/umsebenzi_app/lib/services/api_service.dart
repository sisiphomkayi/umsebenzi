import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static const String baseUrl = 'http://localhost:5000/api';

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  static Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('token', token);
  }

  static Future<void> saveUser(Map<String, dynamic> user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('user', jsonEncode(user));
  }

  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('user');
  }

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
      final data = jsonDecode(response.body);
      if (data['success'] == true && data['token'] != null) {
        await saveToken(data['token']);
        await saveUser(data['user']);
      }
      return data;
    } catch (e) {
      return {'success': false, 'message': 'Connection error: $e'};
    }
  }

  static Future<Map<String, dynamic>> getNoticeboardJobs() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/jobs/noticeboard'),
        headers: {'Content-Type': 'application/json'},
      );
      return jsonDecode(response.body);
    } catch (e) {
      return {'success': false, 'message': 'Connection error: $e'};
    }
  }

  static Future<Map<String, dynamic>> postJob({
    required String title,
    required String description,
    required String skillCategory,
    required double payAmount,
    required String location,
    bool isNoticeboard = false,
  }) async {
    try {
      final token = await getToken();
      final response = await http.post(
        Uri.parse('$baseUrl/jobs'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'title': title,
          'description': description,
          'skill_category': skillCategory,
          'pay_amount': payAmount,
          'location': location,
          'is_noticeboard': isNoticeboard,
          'job_type': 'instant',
          'duration_type': 'daily',
        }),
      );
      return jsonDecode(response.body);
    } catch (e) {
      return {'success': false, 'message': 'Connection error: $e'};
    }
  }

  static Future<Map<String, dynamic>> applyForJob(String jobId) async {
    try {
      final token = await getToken();
      final response = await http.post(
        Uri.parse('$baseUrl/jobs/apply'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({'job_id': jobId}),
      );
      return jsonDecode(response.body);
    } catch (e) {
      return {'success': false, 'message': 'Connection error: $e'};
    }
  }
}
