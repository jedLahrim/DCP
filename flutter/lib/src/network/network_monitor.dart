import 'dart:async';

import 'package:connectivity_plus/connectivity_plus.dart';

enum NetworkQuality { offline, poor, moderate, good, excellent }

class NetworkMonitor {
  final Connectivity _connectivity = Connectivity();
  final _qualityController = StreamController<NetworkQuality>.broadcast();

  NetworkMonitor() {
    _connectivity.onConnectivityChanged.listen(_updateStatus);
    _checkInitialStatus();
  }

  Stream<NetworkQuality> get onQualityChange => _qualityController.stream;

  Future<void> _checkInitialStatus() async {
    final result = await _connectivity.checkConnectivity();
    _updateStatus(result);
  }

  void _updateStatus(ConnectivityResult result) {
    // Basic mapping: WiFi/Ethernet -> Good, Mobile -> Moderate/Poor (simulated)
    // In a real app, you'd ping a server to measure latency/throughput.
    NetworkQuality quality;
    switch (result) {
      case ConnectivityResult.wifi:
      case ConnectivityResult.ethernet:
        quality = NetworkQuality.good;
        break;
      case ConnectivityResult.mobile:
        quality = NetworkQuality.moderate;
        break;
      case ConnectivityResult.none:
      default:
        quality = NetworkQuality.offline;
        break;
    }
    _qualityController.add(quality);
  }
}
