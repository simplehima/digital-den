const axios = require('axios');

/**
 * Google Perspective API - AI-based toxicity detection
 * Free API for detecting toxic, profane, threatening content
 * Supports 100+ languages including English and Arabic
 */
class PerspectiveAPI {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.endpoint = 'https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze';
        this.enabled = !!apiKey;
    }

    /**
     * Analyze text for toxicity using AI
     * @param {string} text - Text to analyze
     * @returns {Object|null} Toxicity scores or null if disabled/error
     */
    async analyzeText(text) {
        if (!this.enabled) return null;
        if (!text || text.length < 3) return null;

        try {
            const response = await axios.post(
                `${this.endpoint}?key=${this.apiKey}`,
                {
                    comment: { text },
                    languages: ['en', 'ar'], // English and Arabic
                    requestedAttributes: {
                        TOXICITY: {},
                        SEVERE_TOXICITY: {},
                        IDENTITY_ATTACK: {},
                        INSULT: {},
                        PROFANITY: {},
                        THREAT: {}
                    }
                },
                {
                    timeout: 3000 // 3 second timeout
                }
            );

            const scores = {};
            for (const [key, value] of Object.entries(response.data.attributeScores)) {
                scores[key] = value.summaryScore.value;
            }

            return scores;
        } catch (error) {
            // Don't log every error - just return null
            if (error.code !== 'ECONNABORTED') {
                console.error(`[Perspective API] Error: ${error.message}`);
            }
            return null;
        }
    }

    /**
     * Check if scores indicate toxic content
     * @param {Object} scores - Scores from analyzeText
     * @param {number} threshold - Minimum score to consider toxic (0-1)
     * @returns {boolean}
     */
    isToxic(scores, threshold = 0.7) {
        if (!scores) return false;

        return scores.TOXICITY > threshold ||
            scores.SEVERE_TOXICITY > threshold ||
            scores.PROFANITY > threshold ||
            scores.THREAT > threshold ||
            scores.INSULT > threshold;
    }

    /**
     * Get the highest toxicity type
     * @param {Object} scores
     * @returns {string}
     */
    getTopToxicityType(scores) {
        if (!scores) return 'Unknown';

        let maxScore = 0;
        let maxType = 'Toxic Content';

        const typeNames = {
            TOXICITY: 'Toxic',
            SEVERE_TOXICITY: 'Severely Toxic',
            PROFANITY: 'Profane',
            INSULT: 'Insulting',
            THREAT: 'Threatening',
            IDENTITY_ATTACK: 'Identity Attack'
        };

        for (const [key, score] of Object.entries(scores)) {
            if (score > maxScore) {
                maxScore = score;
                maxType = typeNames[key] || key;
            }
        }

        return maxType;
    }
}

module.exports = PerspectiveAPI;
