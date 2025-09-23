const readline = require('readline');
const { UserService } = require('../models/User');
const { PostService } = require('../models/Post');
const { PostInteractionService } = require('../models/PostInteraction');

class CLI {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.currentUser = null;
  }

  async start() {
    console.log('🚀 Simple CLI');
    console.log('Commands: login <username>, post <content>, list, like <postId>, exit');
    await this.showPrompt();
  }

  async showPrompt() {
    const userInfo = this.currentUser ? `[${this.currentUser.username}]` : '[guest]';
    this.rl.question(`${userInfo} > `, async (input) => {
      await this.handleCommand(input.trim());
      await this.showPrompt();
    });
  }

  async handleCommand(input) {
    const [command, ...args] = input.split(' ');

    switch(command) {
      case 'login': await this.login(args[0]); break;
      case 'post': await this.createPost(args.join(' ')); break;
      case 'list': await this.listPosts(); break;
      case 'like': await this.likePost(args[0]); break;
      case 'exit': this.exit(); break;
      default: console.log('Unknown command');
    }
  }


  exit() {
    console.log('Goodbye!');
    process.exit(0);
  }


  async login(username) {
    const userService = new UserService();
    const result = await userService.findByUsername(username);

    if (result.success) {
      this.currentUser = result.data;
      console.log(`Logged in as ${this.currentUser.username}`);
    } else {
      console.log('User not found');
    }
  }

  async createPost(content) {
    if (!this.currentUser) {
      console.log('Please login first');
      return;
    }

    const postService = new PostService();
    const result = await postService.create({
      author: this.currentUser._id,
      content
    });

    if (result.success) {
      console.log('Post created!');
    } else {
      console.log('Error creating post');
    }
  }

  async listPosts() {
    const postService = new PostService();
    const result = await postService.list({}, 10, 0);

    if (result.success) {
      console.log('Recent posts:');
      result.data.forEach(post => {
        const author = post.authorData?.username || 'Unknown';
        console.log(`@${author}: ${post.content} [ID: ${post._id}]`);
      });
    } else {
      console.log('Error listing posts');
    }
  }

  async likePost(postId) {
    if (!this.currentUser) {
      console.log('Please login first');
      return;
    }

    const interactionService = new PostInteractionService();
    const result = await interactionService.likePost(this.currentUser._id, postId);

    if (result.success) {
      console.log('Post liked!');
    } else {
      console.log('Error liking post');
    }
  }

}

if (require.main === module) {
  const cli = new CLI();
  cli.start().catch(console.error);
}

module.exports = CLI;