import { SQLite } from 'expo';

module.exports = SQLite.openDatabase({ name: 'site.db' });