import { describe, it, expect, vi } from 'vitest';
import { NetworkMonitor, NetworkQuality } from '../src/network/NetworkMonitor';
import { ResourceManager } from '../src/resources/ResourceManager';
import { InMemoryStorage } from '../src/storage/InMemoryStorage';

describe('NetworkMonitor', () => {
    it('should report quality', async () => {
        const monitor = new NetworkMonitor();
        const quality = await monitor.probe();
        expect(quality).toBeDefined();
        // Since we mocked/shimmed it, it returns a value based on execution time or connection
        console.log('Reported Quality:', quality);
        expect(Object.values(NetworkQuality).includes(quality)).toBe(true);
    });
});

describe('ResourceManager', () => {
    it('should prefetch resources for a known route', async () => {
        const storage = new InMemoryStorage();
        const network = new NetworkMonitor();
        // Mock network to be good
        vi.spyOn(network, 'getQuality').mockReturnValue(NetworkQuality.GOOD);

        const resourceManager = new ResourceManager(network, storage);

        // Trigger optimization
        await resourceManager.optimizeForRoute('/home');

        // Check if resources were "cached" in storage
        const avatar = await storage.get('cache:user-avatar.png');
        expect(avatar).toBeDefined();
    });

    it('should skip prefetch if network is poor', async () => {
        const storage = new InMemoryStorage();
        const network = new NetworkMonitor();
        vi.spyOn(network, 'getQuality').mockReturnValue(NetworkQuality.POOR);

        const resourceManager = new ResourceManager(network, storage);
        await resourceManager.optimizeForRoute('/home');

        const avatar = await storage.get('cache:user-avatar.png');
        expect(avatar).toBeNull();
    });
});
