const database = require('../config/database');
const { ObjectId } = require('mongodb');

class UserRelationship {
  constructor(relationshipData = {}) {
    this._id = relationshipData._id || null;
    this.follower = relationshipData.follower || null;
    this.following = relationshipData.following || null;
    this.createdAt = relationshipData.createdAt || new Date();
  }
}

class UserRelationshipService {
  constructor() {
    this.collection = null;
  }

  async init() {
    if (!this.collection) {
      const db = await database.connect();
      this.collection = db.collection('userrelationships');
    }
  }

  async follow(followerId, followingId) {
    await this.init();

    if (followerId === followingId) {
      return { success: false, message: 'Cannot follow yourself' };
    }

    const existingRelationship = await this.collection.findOne({
      follower: new ObjectId(followerId),
      following: new ObjectId(followingId)
    });

    if (existingRelationship) {
      return { success: false, message: 'Already following' };
    }

    const relationship = new UserRelationship({
      follower: new ObjectId(followerId),
      following: new ObjectId(followingId)
    });

    await this.collection.insertOne(relationship);
    return { success: true, message: 'User followed' };
  }

  async unfollow(followerId, followingId) {
    await this.init();

    const result = await this.collection.deleteOne({
      follower: new ObjectId(followerId),
      following: new ObjectId(followingId)
    });

    if (result.deletedCount === 0) {
      return { success: false, message: 'Not following' };
    }

    return { success: true, message: 'Unfollowed user' };
  }

  async getFollowers(userId) {
    await this.init();

    const followers = await this.collection.find({
      following: new ObjectId(userId)
    }).limit(20).toArray();

    return { success: true, data: followers };
  }

  async getFollowing(userId) {
    await this.init();

    const following = await this.collection.find({
      follower: new ObjectId(userId)
    }).limit(20).toArray();

    return { success: true, data: following };
  }
}

module.exports = { UserRelationship, UserRelationshipService };