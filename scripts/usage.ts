import { DCPClient } from '../src/core/DCPClient';
import { IDCPConfig } from '../src/interfaces';

const config: IDCPConfig = {
    syncIntervalMs: 5000,
    storageQuotaMb: 50,
    retryStrategy: {
        maxRetries: 3,
        initialDelayMs: 1000,
        backoffFactor: 2,
    },
};

async function main() {
    console.log('--- DCP Usage Example ---');
    const client = new DCPClient(config);
    await client.init();

    const storage = (client as any).storage; // accessing private for demo
    await storage.put('demo-key', { message: 'Hello DCP World!' });

    const value = await storage.get('demo-key');
    console.log('Retrieved from storage:', value);
}

main().catch(console.error);
