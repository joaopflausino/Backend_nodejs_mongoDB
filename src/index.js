const database = require('./config/database');
const HTTPServer = require('./http/server');

class SimpleBackend {
  constructor(options = {}) {
    this.mongoUrl = options.mongoUrl || process.env.MONGO_URL || 'mongodb://localhost:27017/social_network';
    this.port = options.port || process.env.PORT || 3000;
    this.httpServer = null;
  }

  async start() {
    await database.connect(this.mongoUrl);
    console.log('✅ Connected to MongoDB');

    this.httpServer = new HTTPServer({ port: this.port });
    await this.httpServer.start();
    console.log('✅ Server started');

    return this;
  }

  async stop() {
    if (this.httpServer) {
      await this.httpServer.stop();
    }
    await database.disconnect();
    console.log('✅ Server stopped');
  }

  async createTestData() {
    const db = await database.getDatabase();

    const users = [];
    for (let i = 1; i <= 5; i++) {
      const user = {
        username: `user${i}`,
        email: `user${i}@example.com`,
        displayName: `User ${i}`,
        createdAt: new Date()
      };
      const result = await db.collection('users').insertOne(user);
      users.push({ ...user, _id: result.insertedId });
    }

    const posts = [
      'Hello world! 😊',
      'Learning Node.js is amazing!',
      'Working on a new project',
      'Having a tough day... 😞',
      'Love this new social network!'
    ];

    for (let i = 0; i < users.length; i++) {
      await db.collection('posts').insertOne({
        author: users[i]._id,
        content: posts[i],
        createdAt: new Date()
      });
    }

    console.log('✅ Test data created');
    return users;
  }

  async clearDatabase() {
    const db = await database.getDatabase();
    await db.collection('users').deleteMany({});
    await db.collection('posts').deleteMany({});
    console.log('✅ Database cleared');
  }
}

module.exports = SimpleBackend;