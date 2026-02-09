import 'dart:async';

import 'package:connectivity_plus/connectivity_plus.dart';

enum NetworkQuality { offline, poor, moderate, good, excellent }

class NetworkMonitor {
  final Connectivity _connectivity = Connectivity();
  final _qualityController = StreamController<NetworkQuality>.broadcast();

  NetworkMonitor() {
    // connectivity_plus 6.x returns a Stream of List<ConnectivityResult>
    _connectivity.onConnectivityChanged.listen((List<ConnectivityResult> results) {
      _updateStatus(results);
    });
    _checkInitialStatus();
  }

  Stream<NetworkQuality> get onQualityChange => _qualityController.stream;

  Future<void> _checkInitialStatus() async {
    // connectivity_plus 6.x returns Future<List<ConnectivityResult>>
    final List<ConnectivityResult> results = await _connectivity.checkConnectivity();
    _updateStatus(results);
  }

  void _updateStatus(List<ConnectivityResult> results) {
    NetworkQuality quality = NetworkQuality.offline;

    if (results.contains(ConnectivityResult.wifi) || results.contains(ConnectivityResult.ethernet)) {
      quality = NetworkQuality.good;
    } else if (results.contains(ConnectivityResult.mobile)) {
      quality = NetworkQuality.moderate;
    } else if (results.isEmpty || results.contains(ConnectivityResult.none)) {
      quality = NetworkQuality.offline;
    }

    _qualityController.add(quality);
  }
}
