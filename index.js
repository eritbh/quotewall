'use strict';

const fs = require('fs');
const log = require('another-logger');
const r = require('rethinkdb');
const polka = require('polka');
const ejs = require('ejs');
const config = require('./config');

let conn; // The rethinkdb connection to run queries against
r.connect(config.rethinkdb).then(connection => conn = connection);

/**
 * Helper function to render an ejs file and send its output in a response.
 * @param {*} res The response to send the rendered output in.
 * @param {string} filename The filename to load and render.
 * @param {*} data The data to pass to the renderer.
 */
function render (res, filename, data) {
	res.end(ejs.render(fs.readFileSync(filename, 'utf-8'), data));
}

const app = polka();

app.get('/', (req, res) => {
	render(res, 'pages/index.ejs', {
		quotes: [
			{
				text: 'no u',
				attribution: 'George, 2018',
				id: 0
			}
		]
	});
});

app.get('/random', (req, res) => {
	res.end('TODO');
});

app.get('/quote/:id', (req, res) => {
	res.end('TODO');
});

app.post('/quote/new', (req, res) => {
	res.end('TODO');
});

app.listen(3000).then(() => {
	log.success('Listening on port 3000');
});
