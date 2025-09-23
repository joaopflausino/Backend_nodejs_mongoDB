const database = require('../config/database');
const { ObjectId } = require('mongodb');

class Logger {
  constructor() {
    this.collection = null;
  }

  async init() {
    try {
      if (!this.collection) {
        const db = await database.connect();
        this.collection = db.collection('logs');
      }
    } catch (error) {
      console.error('L Erro ao inicializar Logger:', error);
      throw error;
    }
  }

  async log(level, message, context = {}, userId = null, action = null) {
    try {
      await this.init();

      const logEntry = {
        level: level.toLowerCase(),
        message,
        context,
        timestamp: new Date(),
        userId: userId ? new ObjectId(userId) : null,
        action
      };

      await this.collection.insertOne(logEntry);
      
      const consoleMessage = `[${level.toUpperCase()}] ${new Date().toISOString()} - ${message}`;
      
      switch (level.toLowerCase()) {
        case 'error':
          console.error(consoleMessage, context);
          break;
        case 'warning':
          console.warn(consoleMessage, context);
          break;
        case 'info':
          console.info(consoleMessage, context);
          break;
        case 'debug':
          console.log(consoleMessage, context);
          break;
        default:
          console.log(consoleMessage, context);
      }

    } catch (error) {
      console.error('L Erro ao registrar log:', error);
    }
  }

  async error(message, context = {}, userId = null, action = null) {
    return this.log('error', message, context, userId, action);
  }

  async warning(message, context = {}, userId = null, action = null) {
    return this.log('warning', message, context, userId, action);
  }

  async info(message, context = {}, userId = null, action = null) {
    return this.log('info', message, context, userId, action);
  }

  async debug(message, context = {}, userId = null, action = null) {
    return this.log('debug', message, context, userId, action);
  }

  async getLogs(filter = {}, limit = 100, skip = 0) {
    try {
      await this.init();
      
      const query = {};
      
      if (filter.level) {
        query.level = filter.level;
      }
      
      if (filter.userId) {
        query.userId = new ObjectId(filter.userId);
      }
      
      if (filter.action) {
        query.action = filter.action;
      }
      
      if (filter.startDate && filter.endDate) {
        query.timestamp = {
          $gte: new Date(filter.startDate),
          $lte: new Date(filter.endDate)
        };
      }

      const logs = await this.collection
        .find(query)
        .sort({ timestamp: -1 })
        .limit(limit)
        .skip(skip)
        .toArray();

      return {
        success: true,
        data: logs,
        total: await this.collection.countDocuments(query)
      };

    } catch (error) {
      console.error('L Erro ao buscar logs:', error);
      return {
        success: false,
        message: 'Erro ao buscar logs',
        error: error.message
      };
    }
  }

  async getLogStats(userId = null) {
    try {
      await this.init();
      
      const match = userId ? { userId: new ObjectId(userId) } : {};
      
      const stats = await this.collection.aggregate([
        { $match: match },
        {
          $group: {
            _id: '$level',
            count: { $sum: 1 }
          }
        }
      ]).toArray();

      const result = {
        error: 0,
        warning: 0,
        info: 0,
        debug: 0
      };

      stats.forEach(stat => {
        result[stat._id] = stat.count;
      });

      return {
        success: true,
        data: result
      };

    } catch (error) {
      console.error('L Erro ao buscar estatísticas de logs:', error);
      return {
        success: false,
        message: 'Erro ao buscar estatísticas',
        error: error.message
      };
    }
  }

  async clearOldLogs(daysToKeep = 30) {
    try {
      await this.init();
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      const result = await this.collection.deleteMany({
        timestamp: { $lt: cutoffDate }
      });

      await this.info('Logs antigos removidos', {
        deletedCount: result.deletedCount,
        cutoffDate
      }, null, 'cleanup_logs');

      return {
        success: true,
        deletedCount: result.deletedCount
      };

    } catch (error) {
      console.error('L Erro ao limpar logs antigos:', error);
      return {
        success: false,
        message: 'Erro ao limpar logs',
        error: error.message
      };
    }
  }
}

module.exports = Logger;