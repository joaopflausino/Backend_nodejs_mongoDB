const { ObjectId } = require('mongodb');
const Connection = require('../database/connection');
const Validator = require('../utils/Validator');

class User {
    constructor(userData = {}) {
        this.username = userData.username;
        this.email = userData.email;
        this.createdAt = userData.createdAt || new Date();
        this.connection = new Connection();
    }

    async save() {
        try {
            Validator.validateUserData(this);
            
            const db = await this.connection.connect();
            const collection = db.collection('users');
            
            const existingUser = await collection.findOne({
                $or: [{ username: this.username }, { email: this.email }]
            });
            
            if (existingUser) {
                throw new Error('Usuário ou email já existe');
            }

            const result = await collection.insertOne({
                username: this.username,
                email: this.email,
                createdAt: this.createdAt
            });

            return result.insertedId;
        } catch (error) {
            throw error;
        } finally {
            await this.connection.disconnect();
        }
    }

    static async findById(userId) {
        const connection = new Connection();
        
        try {
            const db = await connection.connect();
            const collection = db.collection('users');
            
            const user = await collection.findOne({ _id: (ObjectId.isValid(userId) && userId.length === 24) ? ObjectId.createFromHexString(userId) : userId });
            return user;
        } catch (error) {
            console.log('Erro ao buscar usuário por ID', error);
            throw error;
        } finally {
            await connection.disconnect();
        }
    }

    static async findByUsername(username) {
        const connection = new Connection();
        
        try {
            Validator.validateRequired(username, 'username');
            
            const db = await connection.connect();
            const collection = db.collection('users');
            
            const user = await collection.findOne({ username: username });
            return user;
        } catch (error) {
            console.log('Erro ao buscar usuário por username', error);
            throw error;
        } finally {
            await connection.disconnect();
        }
    }

    static async getAllUsers() {
        const connection = new Connection();
        
        try {
            const db = await connection.connect();
            const collection = db.collection('users');
            
            const users = await collection.find({}).toArray();
            return users;
        } catch (error) {
            console.log('Erro ao buscar todos os usuários', error);
            throw error;
        } finally {
            await connection.disconnect();
        }
    }

    static async deleteById(userId) {
        const connection = new Connection();
        
        try {
            const db = await connection.connect();
            const collection = db.collection('users');
            
            const result = await collection.deleteOne({ _id: (ObjectId.isValid(userId) && userId.length === 24) ? ObjectId.createFromHexString(userId) : userId });
            
            if (result.deletedCount > 0) {
                console.log(`Usuário ${userId} deletado com sucesso`);
            }
            
            return result.deletedCount > 0;
        } catch (error) {
            console.log('Erro ao deletar usuário', error);
            throw error;
        } finally {
            await connection.disconnect();
        }
    }
}

module.exports = User;