require('dotenv').config();
const fastify = require('fastify')({ logger: true });

const authRoutes = require('./routes/auth-routes');
const userRoutes = require('./routes/user-routes');
const leaderboardRoutes = require('./routes/leaderboard-routes');

fastify.register(require('./plugins/db-connection'));
fastify.register(require('fastify-cors'), {
	origin: '*',
});

fastify.register(authRoutes, { prefix: '/api/auth' });
fastify.register(userRoutes, { prefix: '/api/users' });
fastify.register(leaderboardRoutes, { prefix: '/api/leaderboard' });

fastify.get('/', (request, reply) => {
	reply.send('Hello, world!');
});

const PORT = process.env.PORT || 4000;

fastify.listen(PORT, (err, address) => {
	console.log(`Server is running on ${address}`);
});
