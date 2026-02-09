# dcp_client

A Dart client for the Dart Connect Protocol (DCP), an offline-first synchronization protocol designed for local-first applications.

## Features

- **Offline-First**: Prioritizes local storage and operation.
- **Synchronization**: Automatically syncs data when online.
- **Network Intelligence**: Monitors network quality to optimize resource usage.

## Getting Started

Add `dcp_client` to your `pubspec.yaml`:

```yaml
dependencies:
  dcp_client: ^0.0.1
```

## Usage

```dart
import 'package:dcp_client/dcp_client.dart';

void main() async {
  final client = DCPClient(
    config: DCPConfig(apiEndpoint: 'https://api.myapp.com'),
  );
  
  await client.init();
  
  // Write data
  await client.write('user:1', {'name': 'Alice'});
  
  // Read data
  final user = await client.read('user:1');
  print(user);
}
```

## Additional Information

For more information, visit the [homepage](https://github.com/jedLahrim/DCP.git).
