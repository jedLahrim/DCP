abstract class IStorageProvider {
  /// Initializes the storage provider (e.g., opens database connection).
  Future<void> init();

  /// Stores a value associated with a specific key.
  ///
  /// [key] The unique identifier for the data.
  /// [value] The data to store. Can be a Map, List, or any JSON-encodable object.
  ///
  /// Example:
  /// ```dart
  /// await storage.put('user:1', User(name: 'Alice'));
  /// await storage.put('items', [1, 2, 3]);
  /// ```
  Future<void> put(String key, dynamic value);

  /// Retrieves data for a given key.
  ///
  /// Returns `null` if the key is not found.
  /// The return type depends on what was stored (Map, List, etc).
  Future<dynamic> get(String key);

  /// Deletes data associated with a key.
  ///
  /// Example:
  /// ```dart
  /// await storage.delete('user:1');
  /// ```
  Future<void> delete(String key);

  /// Lists keys matching a prefix.
  ///
  /// [prefix] Optional prefix to filter keys.
  ///
  /// Example:
  /// ```dart
  /// final userKeys = await storage.list('user:');
  /// ```
  Future<List<String>> list([String prefix]);
}
