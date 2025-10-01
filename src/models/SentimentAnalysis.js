class SentimentAnalysis {
    constructor() {
        this.positiveWords = [
            'feliz', 'alegre', 'bom', 'ótimo', 'excelente', 'maravilhoso',
            'incrível', 'fantástico', 'perfeito', 'amor', 'sucesso',
            'vitória', 'conquista', 'gratidão', 'sorte', 'benção'
        ];
        
        this.negativeWords = [
            'triste', 'ruim', 'péssimo', 'terrível', 'horrível', 'odiar',
            'raiva', 'frustração', 'decepção', 'fracasso', 'problema',
            'dificuldade', 'preocupação', 'medo', 'ansiedade', 'estresse'
        ];
        
        this.neutralWords = [
            'talvez', 'pode', 'normal', 'regular', 'comum', 'simples'
        ];
    }

    analyzeSentiment(text) {
        try {
            if (!text || typeof text !== 'string') {
                throw new Error('Texto inválido para análise');
            }

            const words = text.toLowerCase().split(/\s+/);
            let positiveScore = 0;
            let negativeScore = 0;
            let neutralScore = 0;

            words.forEach(word => {
                if (this.positiveWords.includes(word)) {
                    positiveScore++;
                } else if (this.negativeWords.includes(word)) {
                    negativeScore++;
                } else if (this.neutralWords.includes(word)) {
                    neutralScore++;
                }
            });

            let sentiment;
            let confidence;

            if (positiveScore > negativeScore) {
                sentiment = 'positive';
                confidence = positiveScore / (positiveScore + negativeScore + neutralScore) || 0;
            } else if (negativeScore > positiveScore) {
                sentiment = 'negative';
                confidence = negativeScore / (positiveScore + negativeScore + neutralScore) || 0;
            } else {
                sentiment = 'neutral';
                confidence = 0.5;
            }

            return {
                sentiment: sentiment,
                confidence: Math.round(confidence * 100) / 100,
                scores: {
                    positive: positiveScore,
                    negative: negativeScore,
                    neutral: neutralScore
                }
            };
        } catch (error) {
            const Logger = require('../utils/Logger');
            const logger = new Logger();
            logger.logError('Erro na análise de sentimento', error);
            throw error;
        }
    }
}

module.exports = SentimentAnalysis;