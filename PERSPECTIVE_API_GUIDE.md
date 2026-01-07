# AI-Based Moderation with Perspective API

## What is Perspective API?

Google's **free** AI service that detects toxic, profane, threatening, and insulting comments in 100+ languages.

**Best part:** It's FREE and detects toxicity you might miss!

---

## Setup (5 minutes)

### 1. Get API Key

1. Go to https://perspectiveapi.com/
2. Click "Get Started"
3. Create a Google Cloud Project
4. Enable Perspective API
5. Create API key
6. Copy your API key

### 2. Add to .env

```bash
PERSPECTIVE_API_KEY=your_api_key_here
```

### 3. Install Package

```bash
npm install @google-cloud/language
# or
npm install axios
```

---

## Implementation

### Enhanced AutoMod with AI

Create: `src/bot/utils/PerspectiveAPI.js`

```javascript
const axios = require('axios');

class PerspectiveAPI {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.endpoint = 'https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze';
    }

    async analyzeText(text) {
        if (!this.apiKey) return null;

        try {
            const response = await axios.post(
                `${this.endpoint}?key=${this.apiKey}`,
                {
                    comment: { text },
                    languages: ['en', 'ar'],
                    requestedAttributes: {
                        TOXICITY: {},
                        SEVERE_TOXICITY: {},
                        IDENTITY_ATTACK: {},
                        INSULT: {},
                        PROFANITY: {},
                        THREAT: {}
                    }
                }
            );

            const scores = {};
            for (const [key, value] of Object.entries(response.data.attributeScores)) {
                scores[key] = value.summaryScore.value;
            }

            return scores;
        } catch (error) {
            console.error('[Perspective API] Error:', error.message);
            return null;
        }
    }

    isToxic(scores, threshold = 0.7) {
        if (!scores) return false;
        
        return scores.TOXICITY > threshold ||
               scores.SEVERE_TOXICITY > threshold ||
               scores.PROFANITY > threshold ||
               scores.THREAT > threshold;
    }
}

module.exports = PerspectiveAPI;
```

### Update messageCreate.js

Add at top:
```javascript
const PerspectiveAPI = require('../../utils/PerspectiveAPI');
const perspectiveAPI = new PerspectiveAPI(process.env.PERSPECTIVE_API_KEY);
```

Add after bad words check:
```javascript
// 1.5 AI-Based Toxicity Detection (if no violation yet)
if (!violation && process.env.PERSPECTIVE_API_KEY) {
    const scores = await perspectiveAPI.analyzeText(message.content);
    if (perspectiveAPI.isToxic(scores, 0.7)) {
        violation = {
            type: 'AI: Toxic Content',
            detail: `Toxicity: ${Math.round(scores.TOXICITY * 100)}%`,
            scores
        };
        action = 'delete';
    }
}
```

---

## Benefits

✅ **Catches missed words** - AI detects variations and slang  
✅ **Multi-language** - Works with Arabic, English, etc.  
✅ **Context-aware** - Understands context, not just keywords  
✅ **Free** - Google provides free quota  
✅ **Always updating** - Google trains on new toxicity  

---

## Limitations

⚠️ **Rate limits** - 1 request/second on free tier  
⚠️ **Latency** - API call adds ~200ms delay  
⚠️ **False positives** - AI might over-flag in some cases  

---

## Alternative: Use Both

**Best approach:**
1. **Keyword filter FIRST** (instant, catches obvious)
2. **AI check SECOND** (catches what keywords missed)

This gives you:
- Instant deletion of known bad words
- AI backup for new/creative profanity
- Best of both worlds!

---

## Recommendation

For your server with Arabic + English:
1. ✅ Keep current keyword list (works great)
2. ✅ Add Perspective API as backup
3. ✅ Set threshold to 0.8 (stricter = fewer false positives)

Want me to implement this for you?
