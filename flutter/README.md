# dcp_client

A Dart client for the Dart Connect Protocol (DCP), an offline-first synchronization protocol designed for local-first
applications.

## Features

- **Scalable Storage**: Uses **SQLite** for metadata (>5GB) and File System for large assets (>4GB).
- **Offline-First**: Prioritizes local storage and operation.
- **Synchronization**: Automatically syncs data when online.
- **Network Intelligence**: Monitors network quality to optimize resource usage.

## Getting Started

Add `dcp_client` to your `pubspec.yaml` (along with required dependencies):

```yaml
dependencies:
  dcp_client:
    path: ./
  sqflite: ^2.3.0
  path: ^1.9.0
  path_provider: ^2.1.1
  dio: ^5.3.3
  connectivity_plus: ^6.0.5
```

## Usage

```dart
import 'package:dcp_client/dcp_client.dart';

void main() async {
  final client = DCPClient(
    config: DCPConfig(storageLimit: DCPStorageLimit.limit10GB),
  );

  await client.init();

  // Write data (Metadata - Stored in SQLite)
  // Throws exception if storage limit is exceeded
  try {
    await client.write('user:1', {'name': 'Alice', 'bio': '...'});
    await client.write('settings', ['dark_mode', 'notifications']);
  } catch (e) {
    print('Storage limit reached: $e');
  }
  // Download Large Asset (Video/Image - Stored in File System, valid for >4GB)
  try {
    final localPath = await client.downloadAsset('https://example.com/huge-video.mp4', customId: 'video-123');
    print('Video saved to: $localPath');

    // Later retrieval
    final path = await client.getAssetPath('video-123');
    // Use path with VideoPlayer controller
  } catch (e) {
    print('Download failed: $e');
  }
}
```

## Additional Information

For more information, visit the [homepage](https://github.com/jedLahrim/DCP.git).
