const { MongoClient } = require('mongodb');

class DatabaseConnection {
  constructor() {
    this.client = null;
    this.db = null;
    this.isConnected = false;
    this.connectionString = 'mongodb://localhost:27017';
    this.databaseName = 'Backend_nodejs_mongoDB';
  }

  async connect() {
    try {
      if (this.isConnected) {
        return this.db;
      }

      this.client = new MongoClient(this.connectionString, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      await this.client.connect();
      this.db = this.client.db(this.databaseName);
      this.isConnected = true;

      console.log(` Conectado ao MongoDB: ${this.databaseName}`);
      return this.db;
      
    } catch (error) {
      console.error('L Erro ao conectar com MongoDB:', error);
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.client && this.isConnected) {
        await this.client.close();
        this.isConnected = false;
        this.client = null;
        this.db = null;
        console.log(' Desconectado do MongoDB');
      }
    } catch (error) {
      console.error('L Erro ao desconectar do MongoDB:', error);
      throw error;
    }
  }

  getDatabase() {
    if (!this.isConnected || !this.db) {
      throw new Error('Banco de dados não conectado');
    }
    return this.db;
  }

  getCollection(collectionName) {
    const db = this.getDatabase();
    return db.collection(collectionName);
  }

  async ping() {
    try {
      if (!this.db) {
        throw new Error('Banco de dados não conectado');
      }
      await this.db.admin().ping();
      return true;
    } catch (error) {
      console.error('L Erro no ping do MongoDB:', error);
      return false;
    }
  }
}

module.exports = new DatabaseConnection();