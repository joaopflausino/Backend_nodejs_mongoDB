const database = require('../config/database');
const { ObjectId } = require('mongodb');

class User {
  constructor(userData = {}) {
    this._id = userData._id || null;
    this.username = userData.username || '';
    this.email = userData.email || '';
    this.displayName = userData.displayName || '';
    this.bio = userData.bio || '';
    this.createdAt = userData.createdAt || new Date();
    this.isActive = userData.isActive !== undefined ? userData.isActive : true;
  }
}

class UserService {
  constructor() {
    this.collection = null;
  }

  async getCollection() {
    if (!this.collection) {
      const db = await database.getDatabase();
      this.collection = db.collection('users');
    }
    return this.collection;
  }

  async create(userData) {
    const collection = await this.getCollection();

    const existingUser = await collection.findOne({
      $or: [
        { username: userData.username },
        { email: userData.email }
      ]
    });

    if (existingUser) {
      throw new Error(existingUser.username === userData.username ? 'Username exists' : 'Email exists');
    }

    const user = new User({
      ...userData,
      createdAt: new Date(),
      isActive: true
    });

    const result = await collection.insertOne(user);
    return { ...user, _id: result.insertedId };
  }

  async findById(id) {
    const collection = await this.getCollection();
    return await collection.findOne({ _id: new ObjectId(id), isActive: true });
  }

  async findByUsername(username) {
    const collection = await this.getCollection();
    return await collection.findOne({ username, isActive: true });
  }

  async update(id, updateData) {
    const collection = await this.getCollection();

    await collection.updateOne(
      { _id: new ObjectId(id), isActive: true },
      { $set: { ...updateData, updatedAt: new Date() } }
    );

    return await this.findById(id);
  }

  async delete(id) {
    const collection = await this.getCollection();

    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { isActive: false, updatedAt: new Date() } }
    );
  }

  async list(filter = {}, limit = 20, skip = 0) {
    const collection = await this.getCollection();

    const query = { isActive: true, ...filter };
    return await collection
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .toArray();
  }
}

module.exports = { User, UserService };