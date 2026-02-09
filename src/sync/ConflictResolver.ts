/**
 * Basic Conflict Resolver
 * Default Strategy: Last Write Wins (LWW)
 */

export interface IConflictResolver {
    resolve<T>(local: T, remote: T): T;
}

export class LWWResolver implements IConflictResolver {
    resolve<T>(local: T, remote: T): T {
        // In a real LWW, you'd check timestamps.
        // Here we assume 'remote' is the source of truth if conflict happens during pull.
        return remote;
    }
}
