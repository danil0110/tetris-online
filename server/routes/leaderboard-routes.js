async function routes(fastify, options) {
	fastify.get('/', async (request, reply) => {
		const res = await fastify.db.query(`
            SELECT "UserID", "Username", "BestScore" FROM users
            ORDER BY "BestScore" DESC
            LIMIT 10
        `);

		reply.send(res.rows);
	});
}

module.exports = routes;
