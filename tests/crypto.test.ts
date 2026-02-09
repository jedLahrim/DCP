import { describe, it, expect, vi } from 'vitest';
import { CryptoProvider } from '../src/security/CryptoProvider';

describe('CryptoProvider', () => {
    // Mock Web Crypto API since it's not available in Node/Vitest environment by default without setup
    // We can use Node's crypto module or a polyfill, or just mock the interface if we trust the browser API.
    // For unit testing logic, let's mock the methods.

    // BUT, wait, Node 19+ has global crypto. Let's see if it works.
    // If running in older node, might fail.

    it('should encrypt and decrypt strings', async () => {
        if (!globalThis.crypto || !globalThis.crypto.subtle) {
            console.warn('Skipping crypto test: Web Crypto API not available in this environment');
            return;
        }

        const provider = new CryptoProvider(async () => 'my-secret-password');
        const data = { message: 'Secret Data' };

        const encrypted = await provider.encrypt(data);
        expect(typeof encrypted).toBe('string');
        expect(encrypted).not.toContain('Secret Data');

        const decrypted = await provider.decrypt(encrypted);
        expect(decrypted).toEqual(data);
    });
});
