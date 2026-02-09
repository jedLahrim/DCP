import 'dart:io';

import 'package:dio/dio.dart';
import 'package:path_provider/path_provider.dart';
import 'package:uuid/uuid.dart';

class FileStorage {
  final Dio _dio = Dio();
  final Uuid _uuid = Uuid();

  Future<String> get _localPath async {
    // ApplicationSupportDirectory is not backed up to iCloud, avoiding sync issues with large caches.
    // However, if the user explicitly wants persistence across installs/devices (via backup),
    // ApplicationDocumentsDirectory is better, but might be too large for iCloud free tier.
    // Decision: usage is "offline access", so ApplicationSupportDirectory is safer for "cache-like" behavior
    // but the prompt implies persistence. Let's use ApplicationDocumentsDirectory for now as these are user assets.
    if (Platform.isIOS) {
      final directory = await getApplicationDocumentsDirectory();
      return directory.path;
    }
    // Android
    final directory = await getApplicationDocumentsDirectory();
    return directory.path;
  }

  Future<File> saveFile(String url, {String? onId}) async {
    final id = onId ?? _uuid.v4();
    final path = await _localPath;
    final extension = url.split('.').last.split('?').first; // Basic extension extraction
    final filePath = '$path/$id.$extension';

    // Download
    await _dio.download(url, filePath);

    return File(filePath);
  }

  Future<File?> getFile(String filename) async {
    final path = await _localPath;
    final file = File('$path/$filename');
    if (await file.exists()) {
      return file;
    }
    return null;
  }

  Future<void> deleteFile(String filename) async {
    final path = await _localPath;
    final file = File('$path/$filename');
    if (await file.exists()) {
      await file.delete();
    }
  }

  Future<String> getDirectoryPath() async {
    return _localPath;
  }
}
