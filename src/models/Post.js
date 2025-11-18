const { ObjectId, Double, Int32 } = require('bson');
const Connection = require('../database/connection');
const Validator = require('../utils/Validator');
const SentimentAnalysis = require('./SentimentAnalysis');

class Post {
    constructor(postData = {}) {
        this.userId = postData.userId;
        this.content = postData.content;
        this.hashtags = this.extractHashtags(postData.content || '');
        this.mentions = [];
        this.likes = postData.likes || 0;
        this.retweets = postData.retweets || 0;
        this.comments = postData.comments || 0;
        this.isRetweet = postData.isRetweet || false;
        this.createdAt = postData.createdAt || new Date();
        this.updatedAt = postData.updatedAt || new Date();
        this.isDeleted = postData.isDeleted || false;
        this.sentiment = postData.sentiment || null;
        this.connection = new Connection();
        this.sentimentAnalyzer = new SentimentAnalysis();
    }

    extractHashtags(content) {
        const hashtags = content.match(/#[\w]+/g);
        return hashtags ? hashtags.map(tag => tag.substring(1)) : [];
    }

    extractMentions(content) {
        const mentions = content.match(/@[\w]+/g);
        return mentions ? mentions.map(mention => mention.substring(1)) : [];
    }

    async save() {
        try {
            Validator.validateRequired(this.userId, 'userId');
            Validator.validatePostContent(this.content);
            
            this.sentiment = this.sentimentAnalyzer.analyzeSentiment(this.content);
            this.sentiment.analyzedAt = new Date();

            const db = await this.connection.connect();
            const collection = db.collection('posts');
            console.log(`Salvando post para o usuário ${this.userId} com sentimento ${this.sentiment.sentiment}`);

            let confidence = parseFloat(this.sentiment.confidence);
            if (confidence > 1) {
                confidence = confidence / 100;
            }
            if (confidence === 1) {
                confidence = 1.0;
            }
            this.sentiment.confidence = confidence;

            console.log('userId recebido:', this.userId, 'tipo:', typeof this.userId, 'length:', this.userId?.length);

            let userIdObject;
            if (this.userId instanceof ObjectId) {
                userIdObject = this.userId;
            } else if (typeof this.userId === 'string' && this.userId.length === 24) {
                userIdObject = ObjectId.createFromHexString(this.userId);
            } else {
                throw new Error(`userId inválido: ${this.userId}`);
            }

            const postDocument = {
                userId: userIdObject,
                content: this.content,
                hashtags: this.hashtags,
                mentions: this.mentions,
                likes: new Int32(this.likes),
                retweets: new Int32(this.retweets),
                comments: new Int32(this.comments),
                sentiment: {
                    sentiment: this.sentiment.sentiment,
                    confidence: new Double(this.sentiment.confidence),
                    scores: {
                        positive: new Int32(this.sentiment.scores.positive),
                        negative: new Int32(this.sentiment.scores.negative),
                        neutral: new Int32(this.sentiment.scores.neutral)
                    },
                    analyzedAt: this.sentiment.analyzedAt
                },
                isRetweet: this.isRetweet,
                createdAt: this.createdAt,
                updatedAt: this.updatedAt,
                isDeleted: this.isDeleted
            };

            console.log('userId convertido para ObjectId:', userIdObject);
            console.log('confidence:', this.sentiment.confidence, 'tipo:', typeof this.sentiment.confidence);
            console.log('Documento completo a ser inserido:', JSON.stringify(postDocument, null, 2));

            const result = await collection.insertOne(postDocument);

            console.log(`Post criado com sucesso para usuário ${this.userId}`);
            return result.insertedId;
        } catch (error) {
            console.log('Erro ao salvar post', error);
            throw error;
        } finally {
            await this.connection.disconnect();
        }
    }

    static async findById(postId) {
        const connection = new Connection();
        
        try {
            const db = await connection.connect();
            const collection = db.collection('posts');
            
            const post = await collection.findOne({ _id: ObjectId.createFromHexString(postId) });
            return post;
        } catch (error) {
            console.log('Erro ao buscar post por ID', error);
            throw error;
        } finally {
            await connection.disconnect();
        }
    }

    static async findByUserId(userId) {
        const connection = new Connection();
        
        try {
            Validator.validateRequired(userId, 'userId');
            
            const db = await connection.connect();
            const collection = db.collection('posts');
            
            const posts = await collection.find({ userId: ObjectId.createFromHexString(userId) })
                                          .sort({ createdAt: -1 })
                                          .toArray();
            return posts;
        } catch (error) {
            console.log('Erro ao buscar posts por usuário', error);
            throw error;
        } finally {
            await connection.disconnect();
        }
    }

    static async findBySentiment(sentiment) {
        const connection = new Connection();
        
        try {
            Validator.validateRequired(sentiment, 'sentiment');
            
            const db = await connection.connect();
            const collection = db.collection('posts');
            
            const posts = await collection.find({ 'sentiment.sentiment': sentiment })
                                          .sort({ createdAt: -1 })
                                          .toArray();
            return posts;
        } catch (error) {
            console.log('Erro ao buscar posts por sentimento', error);
            throw error;
        } finally {
            await connection.disconnect();
        }
    }

    static async getAllPosts() {
        const connection = new Connection();
        
        try {
            const db = await connection.connect();
            const collection = db.collection('posts');
            
            const posts = await collection.find({})
                                          .sort({ createdAt: -1 })
                                          .toArray();
            return posts;
        } catch (error) {
            console.log('Erro ao buscar todos os posts', error);
            throw error;
        } finally {
            await connection.disconnect();
        }
    }

    static async searchByContent(searchText) {
        const connection = new Connection();
        
        try {
            Validator.validateRequired(searchText, 'texto de busca');
            
            const db = await connection.connect();
            const collection = db.collection('posts');
            
            const posts = await collection.find({
                content: { $regex: searchText, $options: 'i' }
            }).sort({ createdAt: -1 }).toArray();
            
            return posts;
        } catch (error) {
            console.log('Erro ao buscar posts por conteúdo', error);
            throw error;
        } finally {
            await connection.disconnect();
        }
    }

    static async deleteById(postId) {
        const connection = new Connection();
        
        try {
            const db = await connection.connect();
            const collection = db.collection('posts');
            
            const result = await collection.deleteOne({ _id: ObjectId.createFromHexString(postId) });
            
            if (result.deletedCount > 0) {
                console.log(`Post ${postId} deletado com sucesso`);
            }
            
            return result.deletedCount > 0;
        } catch (error) {
            console.log('Erro ao deletar post', error);
            throw error;
        } finally {
            await connection.disconnect();
        }
    }
}

module.exports = Post;
