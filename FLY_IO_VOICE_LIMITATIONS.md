**IMPORTANT:** Music commands on Fly.io face significant limitations due to Discord voice architecture.

## Voice Connection Issues on Fly.io

### The Problem:
Discord voice requires:
- **UDP connections** on dynamic ports
- **WebRTC** handshakes
- **Low latency** for real-time audio

Fly.io free tier limitations:
- ❌ Shared CPUs (high latency spikes)
- ❌ Limited UDP support
- ❌ No dedicated voice routing

### Current Status:
- ✅ Bot deployed and online
- ✅ Commands registered
- ❌ Voice connections timeout (30s abort)
- ❌ UDP packets getting dropped

### Solutions:

**Option 1: Pay for Better Resources** ($5-10/month)
```bash
fly scale memory 1024  # Better performance
fly scale count 1 --region sjc # West coast for better routing
```

**Option 2: Use Different Host for Music**
- Keep Fly.io for bot commands/automod
- Use **Render.com/Railway** specifically for music
- Or run music bot on **your own PC**

**Option 3: Accept Limitations**
Keep music commands but expect:
- ⚠️ Frequent connection failures
- ⚠️ Audio stuttering
- ⚠️ 30s timeout errors

### Recommendation:
For **reliable 24/7 music**, you need:
1. **Oracle Cloud Free Tier** (best free option for voice)
2. **Your own PC** (most reliable)
3. **Paid VPS** ($5/month - DigitalOcean/Linode)

Fly.io is excellent for:
- ✅ Bot commands
- ✅ Automod
- ✅ Logging
- ✅ Text-based features

But struggles with:
- ❌ Voice/music
- ❌ Real-time audio streaming

Your choice!
