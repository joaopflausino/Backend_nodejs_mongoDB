const database = require('../config/database');
const { ObjectId } = require('mongodb');

class Post {
  constructor(postData = {}) {
    this._id = postData._id || null;
    this.author = postData.author || null;
    this.content = postData.content || '';
    this.likes = postData.likes || 0;
    this.comments = postData.comments || 0;
    this.createdAt = postData.createdAt || new Date();
    this.isDeleted = postData.isDeleted || false;
  }
}

class PostService {
  constructor() {
    this.collection = null;
  }

  async getCollection() {
    if (!this.collection) {
      const db = await database.getDatabase();
      this.collection = db.collection('posts');
    }
    return this.collection;
  }

  async create(postData) {
    const collection = await this.getCollection();

    const post = new Post({
      ...postData,
      author: new ObjectId(postData.author),
      likes: 0,
      comments: 0,
      createdAt: new Date(),
      isDeleted: false
    });

    const result = await collection.insertOne(post);
    return { ...post, _id: result.insertedId };
  }

  async findById(id) {
    const collection = await this.getCollection();
    return await collection.findOne({ _id: new ObjectId(id), isDeleted: false });
  }

  async update(id, updateData) {
    const collection = await this.getCollection();

    await collection.updateOne(
      { _id: new ObjectId(id), isDeleted: false },
      { $set: { ...updateData, updatedAt: new Date() } }
    );

    return await this.findById(id);
  }

  async delete(id) {
    const collection = await this.getCollection();

    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { isDeleted: true, updatedAt: new Date() } }
    );
  }

  async list(filter = {}, limit = 20, skip = 0) {
    const collection = await this.getCollection();

    const query = { isDeleted: false, ...filter };
    return await collection
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .toArray();
  }

  async getUserPosts(userId) {
    return await this.list({ author: new ObjectId(userId) });
  }
}

module.exports = { Post, PostService };