class ErrorHandler {
  static handleError(error, context = {}) {
    const errorResponse = {
      success: false,
      message: error.message || 'Erro interno do servidor',
      timestamp: new Date().toISOString(),
      context: context
    };

    console.error('L Erro capturado:', {
      error: error.message,
      stack: error.stack,
      context
    });

    if (error.name === 'ValidationError') {
      errorResponse.type = 'VALIDATION_ERROR';
      errorResponse.statusCode = 400;
    } else if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      errorResponse.type = 'DATABASE_ERROR';
      errorResponse.statusCode = 500;
      
      if (error.code === 11000) {
        errorResponse.message = 'Dados duplicados encontrados';
        errorResponse.statusCode = 409;
      }
    } else if (error.name === 'UnauthorizedError') {
      errorResponse.type = 'UNAUTHORIZED';
      errorResponse.statusCode = 401;
    } else if (error.name === 'ForbiddenError') {
      errorResponse.type = 'FORBIDDEN';
      errorResponse.statusCode = 403;
    } else if (error.name === 'NotFoundError') {
      errorResponse.type = 'NOT_FOUND';
      errorResponse.statusCode = 404;
    } else {
      errorResponse.type = 'INTERNAL_ERROR';
      errorResponse.statusCode = 500;
    }

    return errorResponse;
  }

  static createError(message, type = 'Error', statusCode = 500) {
    const error = new Error(message);
    error.name = type;
    error.statusCode = statusCode;
    return error;
  }

  static ValidationError(message) {
    return this.createError(message, 'ValidationError', 400);
  }

  static UnauthorizedError(message = 'N�o autorizado') {
    return this.createError(message, 'UnauthorizedError', 401);
  }

  static ForbiddenError(message = 'Acesso negado') {
    return this.createError(message, 'ForbiddenError', 403);
  }

  static NotFoundError(message = 'Recurso n�o encontrado') {
    return this.createError(message, 'NotFoundError', 404);
  }

  static ConflictError(message = 'Conflito de dados') {
    return this.createError(message, 'ConflictError', 409);
  }

  static InternalError(message = 'Erro interno do servidor') {
    return this.createError(message, 'InternalError', 500);
  }

  static async logError(error, context = {}) {
    try {
      const Logger = require('../services/Logger');
      const logger = new Logger();
      
      await logger.error('Erro capturado pelo ErrorHandler', {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        },
        context,
        timestamp: new Date()
      });
    } catch (logError) {
      console.error('L Erro ao registrar log:', logError);
    }
  }
}

module.exports = ErrorHandler;