const http = require('http');
const url = require('url');
const { UserService } = require('../models/User');
const { PostService } = require('../models/Post');

class HTTPServer {
  constructor(options = {}) {
    this.port = options.port || 3000;
    this.server = null;
    this.userService = new UserService();
    this.postService = new PostService();
  }

  async start() {
    this.server = http.createServer(this.handleRequest.bind(this));

    return new Promise((resolve, reject) => {
      this.server.listen(this.port, (error) => {
        if (error) reject(error);
        else {
          console.log(`Server running on port ${this.port}`);
          resolve();
        }
      });
    });
  }

  async stop() {
    if (this.server) {
      this.server.close();
    }
  }

  async handleRequest(req, res) {
    const { pathname } = url.parse(req.url);
    const method = req.method;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');

    try {
      let result;

      if (method === 'GET' && pathname === '/users') {
        result = await this.userService.list();
      } else if (method === 'GET' && pathname === '/posts') {
        result = await this.postService.list();
      } else if (method === 'POST' && pathname === '/users') {
        const body = await this.parseBody(req);
        result = await this.userService.create(body);
      } else if (method === 'POST' && pathname === '/posts') {
        const body = await this.parseBody(req);
        result = await this.postService.create(body);
      } else {
        result = { error: 'Not found' };
        res.statusCode = 404;
      }

      res.end(JSON.stringify(result, null, 2));
    } catch (error) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: error.message }));
    }
  }

  parseBody(req) {
    return new Promise((resolve) => {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch {
          resolve({});
        }
      });
    });
  }
}

module.exports = HTTPServer;