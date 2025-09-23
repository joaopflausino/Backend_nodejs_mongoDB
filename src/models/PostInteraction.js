const database = require('../config/database');
const { ObjectId } = require('mongodb');
const Validator = require('../utils/validation');

class PostInteraction {
  constructor(interactionData = {}) {
    this._id = interactionData._id || null;
    this.user = interactionData.user || null;
    this.post = interactionData.post || null;
    this.type = interactionData.type || '';
    this.comment = interactionData.comment || null;
    this.createdAt = interactionData.createdAt || new Date();
  }
}

class PostInteractionService {
  constructor() {
    this.collection = null;
  }

  async init() {
    if (!this.collection) {
      const db = await database.connect();
      this.collection = db.collection('postinteractions');
    }
  }

  async likePost(userId, postId) {
    await this.init();

    if (!Validator.isObjectId(userId) || !Validator.isObjectId(postId)) {
      return { success: false, message: 'IDs inválidos' };
    }

    const existingLike = await this.collection.findOne({
      user: new ObjectId(userId),
      post: new ObjectId(postId),
      type: 'like'
    });

    if (existingLike) {
      return { success: false, message: 'Post já foi curtido' };
    }

    const interaction = new PostInteraction({
      user: new ObjectId(userId),
      post: new ObjectId(postId),
      type: 'like'
    });

    await this.collection.insertOne(interaction);

    const postsCollection = await database.getCollection('posts');
    await postsCollection.updateOne(
      { _id: new ObjectId(postId) },
      { $inc: { likes: 1 } }
    );

    return { success: true, message: 'Post curtido' };
  }

  async unlikePost(userId, postId) {
    await this.init();

    const result = await this.collection.deleteOne({
      user: new ObjectId(userId),
      post: new ObjectId(postId),
      type: 'like'
    });

    if (result.deletedCount === 0) {
      return { success: false, message: 'Like não encontrado' };
    }

    const postsCollection = await database.getCollection('posts');
    await postsCollection.updateOne(
      { _id: new ObjectId(postId) },
      { $inc: { likes: -1 } }
    );

    return { success: true, message: 'Like removido' };
  }

  async commentPost(userId, postId, content) {
    await this.init();

    if (!content || content.length > 280) {
      return { success: false, message: 'Comentário inválido' };
    }

    const interaction = new PostInteraction({
      user: new ObjectId(userId),
      post: new ObjectId(postId),
      type: 'comment',
      comment: { content }
    });

    await this.collection.insertOne(interaction);

    const postsCollection = await database.getCollection('posts');
    await postsCollection.updateOne(
      { _id: new ObjectId(postId) },
      { $inc: { comments: 1 } }
    );

    return { success: true, message: 'Comentário adicionado' };
  }

  async getPostComments(postId) {
    await this.init();

    const comments = await this.collection.find({
      post: new ObjectId(postId),
      type: 'comment'
    }).sort({ createdAt: -1 }).limit(20).toArray();

    return { success: true, data: comments };
  }
}

module.exports = { PostInteraction, PostInteractionService };