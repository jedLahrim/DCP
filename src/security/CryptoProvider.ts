export interface ICryptoProvider {
    encrypt(data: any): Promise<string>;
    decrypt(ciphertext: string): Promise<any>;
}

export class CryptoProvider implements ICryptoProvider {
    private key: CryptoKey | null = null;
    private ivLength = 12;

    constructor(private secretFn: () => Promise<string>) { }

    private async getKey(): Promise<CryptoKey> {
        if (this.key) return this.key;
        const secret = await this.secretFn();
        const enc = new TextEncoder();

        // Use globalThis.crypto for cross-environment compatibility
        const crypto = globalThis.crypto;

        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            enc.encode(secret),
            { name: 'PBKDF2' },
            false,
            ['deriveKey']
        );

        this.key = await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: enc.encode('dcp-salt'),
                iterations: 100000,
                hash: 'SHA-256',
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
        return this.key;
    }

    async encrypt(data: any): Promise<string> {
        const key = await this.getKey();
        const crypto = globalThis.crypto;
        const iv = crypto.getRandomValues(new Uint8Array(this.ivLength));
        const enc = new TextEncoder();
        const encodedData = enc.encode(JSON.stringify(data));

        const encryptedContent = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            key,
            encodedData
        );

        const buffer = new Uint8Array(iv.byteLength + encryptedContent.byteLength);
        buffer.set(iv, 0);
        buffer.set(new Uint8Array(encryptedContent), iv.byteLength);

        // Using base64 for string storage compatibility
        return btoa(String.fromCharCode(...buffer));
    }

    async decrypt(ciphertext: string): Promise<any> {
        const key = await this.getKey();
        const crypto = globalThis.crypto;
        const binaryString = atob(ciphertext);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        const iv = bytes.slice(0, this.ivLength);
        const data = bytes.slice(this.ivLength);

        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            key,
            data
        );

        const dec = new TextDecoder();
        return JSON.parse(dec.decode(decrypted));
    }
}
