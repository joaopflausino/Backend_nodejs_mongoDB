const { ObjectId } = require('mongodb');
const Connection = require('../database/connection');
const Validator = require('../utils/Validator');
const bcrypt = require('bcryptjs');

class User {
    constructor(userData = {}) {
        this.username = userData.username;
        this.email = userData.email;
        this.password = userData.password;
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

            let hashedPassword = null;
            if (this.password) {
                hashedPassword = await bcrypt.hash(this.password, 10);
            }

            const result = await collection.insertOne({
                username: this.username,
                email: this.email,
                password: hashedPassword,
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

    static async authenticate(username, password) {
        const connection = new Connection();

        try {
            Validator.validateRequired(username, 'username');
            Validator.validateRequired(password, 'password');

            const db = await connection.connect();
            const collection = db.collection('users');

            const user = await collection.findOne({ username: username });

            if (!user) {
                return null;
            }

            if (!user.password) {
                throw new Error('Usuário não possui senha cadastrada');
            }

            const isValidPassword = await bcrypt.compare(password, user.password);

            if (!isValidPassword) {
                return null;
            }

            const { password: _, ...userWithoutPassword } = user;
            return userWithoutPassword;
        } catch (error) {
            console.log('Erro ao autenticar usuário', error);
            throw error;
        } finally {
            await connection.disconnect();
        }
    }

    static async register(userData) {
        const connection = new Connection();

        try {
            Validator.validateUserData(userData);
            Validator.validatePassword(userData.password);

            const user = new User(userData);
            const userId = await user.save();

            return userId;
        } catch (error) {
            console.log('Erro ao registrar usuário', error);
            throw error;
        }
    }

    static async findByEmail(email) {
        const connection = new Connection();

        try {
            Validator.validateRequired(email, 'email');

            const db = await connection.connect();
            const collection = db.collection('users');

            const user = await collection.findOne({ email: email });
            return user;
        } catch (error) {
            console.log('Erro ao buscar usuário por email', error);
            throw error;
        } finally {
            await connection.disconnect();
        }
    }
}

module.exports = User;