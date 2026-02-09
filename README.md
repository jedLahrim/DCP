# Dart Connect Protocol (DCP)

DCP is an offline-first synchronization protocol designed for local-first applications. It provides a robust architecture for building apps that work seamlessly offline and sync automatically when online.

## Features

- **Offline-First**: Prioritizes local storage (IndexedDB) and instant UI updates.
- **Synchronization**: Automatic background sync with conflict resolution.
- **Intelligence**: Monitors network quality and predictively pre-fetches resources.
- **Integration**: Ready-to-use SDKs for React and vanilla TypeScript.
- **Security**: Built-in encryption support for data at rest.

## Installation

```bash
npm install dcp-client
```

## Basic Usage

```typescript
import { DCPClient } from 'dcp-client';

const client = new DCPClient({
  apiEndpoint: 'https://api.myapp.com/sync'
});

await client.init();

// Storage API
await client.getStorage().put('user:1', { name: 'Alice' });
const user = await client.getStorage().get('user:1');
```

## React Integration

DCP includes a React SDK for easy integration.

```tsx
import { DCPProvider, useDCPQuery } from 'dcp-client';

function App() {
  return (
    <DCPProvider client={client}>
      <UserProfile />
    </DCPProvider>
  );
}

function UserProfile() {
  const { data, loading } = useDCPQuery('user:1');
  if (loading) return <Spinner />;
  return <div>{data.name}</div>;
}
```

## Documentation

For full documentation, including advanced configuration, Flutter integration, and deployment guides, please see the [Integration Guide](INTEGRATION.md).

## License

ISC
