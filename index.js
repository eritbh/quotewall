'use strict';

const fs = require('fs');
const log = require('another-logger');
const r = require('rethinkdb');
const polka = require('polka');
const ejs = require('ejs');
const config = require('./config');

let conn; // The rethinkdb connection to run queries against
r.connect(config.rethinkdb).then(connection => conn = connection);

const filecache = new Map();
/**
 * Helper function to read a file. In production, files are cached in memory to
 * prevent unnecesary filesystem calls.
 * @param {string} filename The name of the file to read.
 * @returns {string} The contents of the file.
 */
function cachedRead (filename) {
	if (config.dev) return fs.readFileSync(filename, 'utf-8');
	const cached = filecache.get(filename);
	if (cached) return cached;
	const contents = fs.readFileSync(filename, 'utf-8');
	filecache.set(filename, contents);
	return contents;
}

/**
 * Helper function to render an ejs file and send its output in a response.
 * @param {*} res The response to send the rendered output in.
 * @param {string} filename The filename to load and render.
 * @param {*} data The data to pass to the renderer.
 */
function render (res, filename, data) {
	res.end(ejs.render(cachedRead(filename), data));
}

const app = polka({
	onNoMatch (req, res) {
		res.writeHead(301, {Location: '/'});
		res.end();
	}
});

app.get('/', async (req, res) => {
	const quotesCursor = await r.table('quotes').run(conn);
	const quotes = await quotesCursor.toArray();
	render(res, 'pages/index.ejs', {quotes});
});

app.get('/quote/random', async (req, res) => {
	const quote = await r.table('quotes').sample(1).nth(0).run(conn) || {};
	log.info(quote);
	render(res, 'pages/single.ejs', {quote});
});

app.get('/quote/:id', async (req, res) => {
	const quote = await r.table('quotes').get(req.params.id).run(conn) || {};
	render(res, 'pages/single.ejs', {quote});
});

app.post('/quote/new', (req, res) => {
	log.info(req);
	res.end('TODO');
});

app.listen(3000).then(() => {
	log.success('Listening on port 3000');
});
