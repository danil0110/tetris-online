const fp = require('fastify-plugin');
const Pool = require('pg').Pool;
const pool = new Pool({
	user: process.env.PG_USER,
	password: process.env.PG_PASSWORD,
	host: process.env.PG_HOST,
	port: process.env.PG_PORT,
	database: process.env.PG_DBNAME,
});

async function dbConnection(fastify, options, next) {
	fastify.decorate('db', pool);
	next();
}

module.exports = fp(dbConnection);
