const r = require('rethinkdb');
const log = require('another-logger');
const config = require('./config');

(async function main() {
	conn = await r.connect(config.rethinkdb);
	log.success(`Connected to RethinkDB at ${conn.host}:${conn.port}`);

	try {
		await r.dbCreate(config.rethinkdb.db).run(conn);
		log.success(`Created database '${config.rethinkdb.db}'.`);
	} catch {
		log.info(`Database '${config.rethinkdb.db}' already exists.`);
	}

	try {
		await r.tableCreate('quotes').run(conn);
		log.success(`Created table 'quotes'.`);
	} catch {
		log.info(`Table 'quotes' already exists.`);
	}

	process.exit(0);
})();
