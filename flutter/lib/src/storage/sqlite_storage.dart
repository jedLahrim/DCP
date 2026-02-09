import 'dart:convert';

import 'package:path/path.dart';
import 'package:sqflite/sqflite.dart';

import 'i_storage_provider.dart';

class SqliteStorage implements IStorageProvider {
  Database? _db;
  final String dbName;

  SqliteStorage({this.dbName = 'dcp_storage.db'});

  @override
  Future<void> init() async {
    final databasesPath = await getDatabasesPath();
    final path = join(databasesPath, dbName);

    _db = await openDatabase(
      path,
      version: 1,
      onCreate: (db, version) async {
        await db.execute('CREATE TABLE entity (key TEXT PRIMARY KEY, value TEXT)');
      },
    );
  }

  @override
  Future<void> put(String key, dynamic value) async {
    if (_db == null) throw Exception('Database not initialized');
    // jsonEncode calls toJson() on custom objects automatically
    await _db!.insert(
      'entity',
      {'key': key, 'value': jsonEncode(value)},
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  @override
  Future<dynamic> get(String key) async {
    if (_db == null) throw Exception('Database not initialized');
    final List<Map<String, dynamic>> maps = await _db!.query(
      'entity',
      where: 'key = ?',
      whereArgs: [key],
    );

    if (maps.isNotEmpty) {
      return jsonDecode(maps.first['value']);
    }
    return null;
  }

  @override
  Future<void> delete(String key) async {
    if (_db == null) throw Exception('Database not initialized');
    await _db!.delete(
      'entity',
      where: 'key = ?',
      whereArgs: [key],
    );
  }

  @override
  Future<List<String>> list([String prefix = '']) async {
    if (_db == null) throw Exception('Database not initialized');

    String? whereClause;
    List<dynamic>? whereArgs;

    if (prefix.isNotEmpty) {
      whereClause = 'key LIKE ?';
      whereArgs = ['$prefix%'];
    }

    final List<Map<String, dynamic>> maps = await _db!.query(
      'entity',
      columns: ['key'],
      where: whereClause,
      whereArgs: whereArgs,
    );

    return maps.map((e) => e['key'] as String).toList();
  }
}
