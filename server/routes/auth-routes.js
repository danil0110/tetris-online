const bcrypt = require('bcryptjs');

async function routes(fastify, options) {
	fastify.post('/register', async (request, reply) => {
		const { username, password } = request.body;
		const candidate = await fastify.db.query('SELECT * FROM users WHERE "Username" = $1', [username]);
		if (candidate.rows.length) {
			return reply.send({ error: true, message: 'User already exists' });
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const result = await fastify.db.query(
			`
            INSERT INTO users ("Username", "Password")
            VALUES ($1, $2)
            RETURNING *;
        `,
			[username, hashedPassword]
		);
		reply.send(result.rows[0]);
	});

	fastify.post('/login', async (request, reply) => {
		const { username, password } = request.body;
		const candidate = await fastify.db.query('SELECT * FROM users WHERE "Username" = $1', [username]);
		if (!candidate.rows.length) {
			reply.send({ error: true, message: 'User not found' });
		}

		if (!(await bcrypt.compare(password, candidate.rows[0].Password))) {
			reply.send({ error: true, message: 'Incorrect password' });
		}

		reply.send(candidate.rows[0]);
	});
}

module.exports = routes;
