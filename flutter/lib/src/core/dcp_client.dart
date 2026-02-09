import 'dart:async';
import 'dart:convert';

import 'package:flutter/foundation.dart';

import '../network/network_monitor.dart';
import '../storage/file_storage.dart';
import '../storage/i_storage_provider.dart';
import '../storage/sqlite_storage.dart';

enum DCPStorageLimit {
  limit1GB,
  limit5GB,
  limit10GB,
  limit50GB,
  unlimited,
}

class DCPConfig {
  final DCPStorageLimit storageLimit;
  final Duration syncInterval;
  final bool enableAnalytics;

  DCPConfig({
    this.storageLimit = DCPStorageLimit.unlimited,
    this.syncInterval = const Duration(seconds: 30),
    this.enableAnalytics = false,
  });

  int get byteLimit {
    switch (storageLimit) {
      case DCPStorageLimit.limit1GB:
        return 1024 * 1024 * 1024;
      case DCPStorageLimit.limit5GB:
        return 5 * 1024 * 1024 * 1024;
      case DCPStorageLimit.limit10GB:
        return 10 * 1024 * 1024 * 1024;
      case DCPStorageLimit.limit50GB:
        return 50 * 1024 * 1024 * 1024;
      case DCPStorageLimit.unlimited:
        return -1;
    }
  }
}

class DCPClient {
  final DCPConfig config;
  late final IStorageProvider _metadataStorage;
  late final FileStorage _fileStorage;
  late final NetworkMonitor _networkMonitor;

  // ignore: unused_field
  Timer? _syncTimer;

  DCPClient({
    required this.config,
    IStorageProvider? metadataStorage,
  }) {
    _metadataStorage = metadataStorage ?? SqliteStorage();
    _fileStorage = FileStorage();
    _networkMonitor = NetworkMonitor();
  }

  Future<void> init() async {
    await _metadataStorage.init();

    _networkMonitor.onQualityChange.listen((quality) {
      debugPrint('[DCP] Network Quality: $quality');
      if (quality != NetworkQuality.offline) {
        sync();
      }
    });

    _syncTimer = Timer.periodic(config.syncInterval, (_) => sync());
    debugPrint('[DCP] Client Initialized');
  }

  /// Stores any JSON-encodable data (Map, List, Object with toJson)
  Future<void> write(String key, dynamic value) async {
    if (config.storageLimit != DCPStorageLimit.unlimited) {
      final usage = await _metadataStorage.usage();
      // Estimate new size (rough JSON string length)
      final newSize = jsonEncode(value).length;

      if (usage + newSize > config.byteLimit) {
        throw Exception('DCP Storage Limit Exceeded (${config.storageLimit}). Usage: $usage bytes');
      }
    }

    final record = {
      'data': value,
      '_metadata': {
        'timestamp': DateTime.now().millisecondsSinceEpoch,
        'dirty': true,
      }
    };
    await _metadataStorage.put(key, record);
    sync();
  }

  /// Reads a document (returns Map, List, or dynamic)
  Future<dynamic> read(String key) async {
    final record = await _metadataStorage.get(key);
    if (record == null) return null;

    // record is the whole map {data, _metadata} (as map)
    if (record is Map && record.containsKey('data')) {
      return record['data'];
    }
    return record;
  }

  /// Downloads and stores a large file (e.g. video/image)
  /// Returns the local file path to the stored asset.
  Future<String> downloadAsset(String url, {String? customId}) async {
    try {
      final file = await _fileStorage.saveFile(url, onId: customId);

      // Store metadata about this asset
      await write('asset:${customId ?? url}', {
        'url': url,
        'localPath': file.path,
        'size': await file.length(),
        'downloadedAt': DateTime.now().toIso8601String(),
      });

      return file.path;
    } catch (e) {
      debugPrint('[DCP] Download failed: $e');
      rethrow;
    }
  }

  /// Gets the local file for a given asset ID.
  /// Returns null if not found locally.
  Future<String?> getAssetPath(String assetId) async {
    // Check metadata first
    final meta = await read('asset:$assetId');
    if (meta != null && meta['localPath'] != null) {
      return meta['localPath'] as String;
    }
    return null;
    // Note: In a real app, you might want to try finding the file on disk even if metadata is missing,
    // but metadata is the source of truth here.
  }

  Future<void> sync() async {
    // Placeholder for sync logic
    // 1. Get dirty records from _metadataStorage
    // 2. Push to API
    // 3. Pull updates
    // 4. Resolve conflicts
  }
}
