const { MongoClient } = require('mongodb');

class connection {
  constructor() {
    this.client = null;
    this.db = null;
    this.url = process.env.MONGO_URL || 'mongodb://localhost:27017';
    this.dbName = process.env.DB_NAME || 'microblogging';
  }

  async connect(url) {
    try {
      this.client = new MongoClient(this.url);
      await this.client.connect();
      this.db = this.client.db(this.dbName);
      return this.db;
    } catch (error) {
      console.error('Erro ao conectar ao MongoDB:', error);
      throw error;
    }
  }

  
  async disconnect() {
    try {
      if (this.client) {
        await this.client.close();
      }
    } catch (error) {
      console.error('Erro ao desconectar do MongoDB:', error);
      throw error;
    }
  }

  getDatabase() {
    return this.db;
  }
}

module.exports = connection;