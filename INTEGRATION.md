# Dart Connect Protocol (DCP) Integration Guide

DCP is an offline-first synchronization protocol designed for local-first applications. This guide covers how to integrate DCP into your application, whether you are using vanilla TypeScript or React.

## Installation

```bash
npm install dcp-client
# or for this local project
npm link
```

## Basic Configuration

The core of the library is the `DCPClient`.

```typescript
import { DCPClient, NetworkMode } from './src/core/DCPClient';

const client = new DCPClient({
  // Configuration options
  syncInterval: 5000,
  apiEndpoint: 'https://api.myapp.com/sync'
});

await client.init();
```

## Core Concepts

### Storage
DCP automatically selects the best storage provider:
- **Browser**: Uses `IndexedDB` (via `idb`) for persistent storage.
- **Node/Test**: Uses `InMemoryStorage`.

### Network Intelligence
DCP monitors network status and quality:
- **Offline**: Pauses sync.
- **Online (Good Quality)**: actively pre-fetches resources.
- **Online (Poor Quality)**: minimal sync, disables pre-fetching.

## Usage: Vanilla TypeScript

### Reading and Writing Data
```typescript
const storage = client.getStorage();

// Write data (automatically synced to backend)
await storage.put('user:123', { name: 'Alice', age: 30 });

// Read data (from local cache instantly)
const user = await storage.get('user:123');
```

### Encryption
To enable at-rest encryption for sensitive data, provide a `CryptoProvider` to the storage layer (or configure `DCPClient` to use it - *integration in progress*).

```typescript
import { CryptoProvider } from './src/security/CryptoProvider';

// Initialize with a secure password or key derivation function
const crypto = new CryptoProvider(async () => 'user-secret-password');
const storage = new BrowserStorage(crypto);
```

## Usage: React Integration

DCP provides a comprehensive React SDK for seamless integration.

### 1. Setup Provider
Wrap your application root with `DCPProvider`.

```tsx
import { DCPClient } from './src/core/DCPClient';
import { DCPProvider } from './src/react';

const client = new DCPClient({});

function App() {
  return (
    <DCPProvider client={client}>
      <MainComponent />
    </DCPProvider>
  );
}
```

### 2. Access Data with Hooks
Use `useDCPQuery` for reactive data fetching.

```tsx
import { useDCPQuery } from './src/react';

function UserProfile() {
  const { data, loading, error } = useDCPQuery<{ name: string }>('user:123');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error!</div>;

  return <h1>Hello, {data?.name}</h1>;
}
```

### 3. Route Optimization
Trigger predictive pre-loading when routes change to ensure data is ready before components render.

```tsx
import { useDCP } from './src/react';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function AppLayout() {
  const client = useDCP();
  const location = useLocation();

  useEffect(() => {
    // Hints the intelligent engine to pre-fetch resources for this route
    client.routeChanged(location.pathname);
  }, [location, client]);

  return <Outlet />;
}
```

## Troubleshooting

### Sync Issues
- Check the console logs for `[DCP]` messages.
- Ensure `IndexedDB` is supported in your browser environment.

### Network Quality
- If pre-fetching isn't happening, DCP might verify your network quality as `POOR`. Check `client.getNetworkMonitor().getQuality()`.

## usage: Flutter Integration

For Flutter applications, you can use the reference Dart implementation provided in `flutter/lib/dcp_client.dart`.

### 1. Structure
Copy the reference `dcp_client.dart` into your project. We recommend using `hive` for storage and `connectivity_plus` for network monitoring.

### 2. Initialization

```dart
import 'dcp_client.dart';

void main() async {
  final client = DCPClient(
    config: DCPConfig(apiEndpoint: 'https://api.myapp.com'),
  );
  
  await client.init();
  
  runApp(MyApp(client: client));
}
```

### 3. Usage in Widgets

```dart
class UserProfile extends StatelessWidget {
  final DCPClient client;
  final String userId;

  const UserProfile({required this.client, required this.userId});

  @override
  Widget build(BuildContext context) {
    return FutureBuilder(
      future: client.read('user:$userId'),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return CircularProgressIndicator();
        }
        if (!snapshot.hasData) return Text('No user found');
        
        final user = snapshot.data as Map<String, dynamic>;
        return Text('Hello, ${user['name']}');
      },
  }
}
```

## Deployment

### Publishing to npm (Web/Node)

To publish `dcp-client` to the npm registry:

1.  **Prepare**: Ensure `package.json` has the correct `name`, `version`, and `main` entry point.
2.  **Build**: Compile TypeScript to JavaScript.
    ```bash
    npm run build
    ```
3.  **Login**: Authenticate with your npm account.
    ```bash
    npm login
    ```
4.  **Publish**:
    ```bash
    npm publish --access public
    ```

### Publishing to pub.dev (Flutter/Dart)

To publish the Flutter client to pub.dev:

1.  **Prepare**: Ensure `flutter/pubspec.yaml` exists and has the correct `name`, `version`, and `homepage`.
2.  **Verify**: Run the pre-publish checks.
    ```bash
    cd flutter
    dart pub publish --dry-run
    ```
3.  **Login & Publish**:
    ```bash
    dart pub publish
    ```
    You will be prompted to authenticate via your browser.

