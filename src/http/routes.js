const { UserService } = require('../models/User');
const { PostService } = require('../models/Post');
const { UserRelationshipService } = require('../models/UserRelationship');
const { PostInteractionService } = require('../models/PostInteraction');

class Router {
  constructor() {
    this.routes = new Map();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.addRoute('GET', '/users', this.getUsers.bind(this));
    this.addRoute('POST', '/users', this.createUser.bind(this));
    this.addRoute('GET', '/posts', this.getPosts.bind(this));
    this.addRoute('POST', '/posts', this.createPost.bind(this));
    this.addRoute('POST', '/posts/:id/like', this.likePost.bind(this));
    this.addRoute('GET', '/', this.getApiInfo.bind(this));
  }

  addRoute(method, path, handler) {
    const key = `${method}:${path}`;
    this.routes.set(key, { method, path, handler, params: this.extractParams(path) });
  }

  extractParams(path) {
    const params = [];
    const parts = path.split('/');

    parts.forEach((part, index) => {
      if (part.startsWith(':')) {
        params.push({ name: part.slice(1), index });
      }
    });

    return params;
  }

  async route(context) {
    const { method, pathname } = context;

    const route = this.findRoute(method, pathname);

    if (!route) {
      return {
        success: false,
        message: 'Rota não encontrada',
        statusCode: 404
      };
    }

    const params = this.extractRouteParams(route, pathname);
    context.params = params;

    try {
      return await route.handler(context);
    } catch (error) {
      console.error('Erro no handler da rota:', error);
      return {
        success: false,
        message: error.message || 'Erro interno do servidor',
        statusCode: error.statusCode || 500
      };
    }
  }

  findRoute(method, pathname) {
    const exactMatch = this.routes.get(`${method}:${pathname}`);
    if (exactMatch) return exactMatch;

    for (const [key, route] of this.routes) {
      if (route.method === method && this.matchPath(route.path, pathname)) {
        return route;
      }
    }

    return null;
  }

  matchPath(routePath, requestPath) {
    const routeParts = routePath.split('/');
    const requestParts = requestPath.split('/');

    if (routeParts.length !== requestParts.length) return false;

    return routeParts.every((part, index) => {
      return part.startsWith(':') || part === requestParts[index];
    });
  }

  extractRouteParams(route, pathname) {
    const params = {};
    const routeParts = route.path.split('/');
    const pathParts = pathname.split('/');

    routeParts.forEach((part, index) => {
      if (part.startsWith(':')) {
        const paramName = part.slice(1);
        params[paramName] = pathParts[index];
      }
    });

    return params;
  }

  async getUsers(context) {
    const userService = new UserService();
    return await userService.list({}, 20, 0);
  }

  async createUser(context) {
    const userService = new UserService();
    return await userService.create(context.body);
  }

  async getPosts(context) {
    const postService = new PostService();
    return await postService.list({}, 20, 0);
  }

  async createPost(context) {
    const postService = new PostService();
    return await postService.create(context.body);
  }

  async likePost(context) {
    const interactionService = new PostInteractionService();
    const { userId } = context.body;
    return await interactionService.likePost(userId, context.params.id);
  }


  async getApiInfo(context) {
    return {
      success: true,
      data: {
        name: 'Simple API',
        endpoints: ['GET /users', 'POST /users', 'GET /posts', 'POST /posts', 'POST /posts/:id/like']
      }
    };
  }
}

module.exports = Router;