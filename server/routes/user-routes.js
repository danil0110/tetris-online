async function routes(fastify, options) {
	fastify.get('/', async (request, reply) => {
		const result = await fastify.db.query('SELECT * FROM users');
		if (result.rows) {
			reply.send(result.rows);
		}
	});

	fastify.get('/:id', async (request, reply) => {
		const result = await fastify.db.query(
			`
            SELECT * FROM users
            WHERE "UserID" = $1
        `,
			[request.params.id]
		);

		if (result.rows) {
			reply.send(result.rows[0]);
		}
	});

	fastify.put('/:id/set-score', async (request, reply) => {
		const { id, score } = request.body;
		const result = await fastify.db.query('UPDATE users SET "BestScore" = $1 WHERE "UserID" = $2 RETURNING *', [score, id]);
		reply.send(result.rows[0]);
	});
}

module.exports = routes;
