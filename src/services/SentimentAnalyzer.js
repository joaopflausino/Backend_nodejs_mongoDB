const natural = require('natural');

const positiveWords = ['good', 'great', 'excellent', 'amazing', 'happy', 'love', 'perfect'];
const negativeWords = ['bad', 'terrible', 'awful', 'sad', 'hate', 'horrible'];

function analyzeSentiment(text) {
  if (!text) return { score: 0, label: 'neutral' };

  const words = text.toLowerCase().split(' ');
  let score = 0;

  words.forEach(word => {
    if (positiveWords.includes(word)) score++;
    if (negativeWords.includes(word)) score--;
  });

  if (text.includes('😊') || text.includes('😀')) score++;
  if (text.includes('😞') || text.includes('😢')) score--;

  const label = score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral';

  return { score, label };
}

module.exports = { analyzeSentiment };