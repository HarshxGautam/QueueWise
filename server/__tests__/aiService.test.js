const { calculateEstimatedWaitTime, generateAiQueueInsights, processAiChatQuery } = require('../services/aiService');

describe('aiService', () => {
  describe('calculateEstimatedWaitTime', () => {
    it('returns minimum 2 minutes for empty queue', () => {
      expect(calculateEstimatedWaitTime(0, 8, 1, 'standard')).toBe(2);
    });

    it('calculates standard wait time correctly', () => {
      expect(calculateEstimatedWaitTime(3, 10, 2, 'standard')).toBe(15);
    });

    it('reduces wait time for VIP priority', () => {
      const standard = calculateEstimatedWaitTime(3, 10, 2, 'standard');
      const vip = calculateEstimatedWaitTime(3, 10, 2, 'vip');
      expect(vip).toBeLessThan(standard);
    });

    it('handles single counter', () => {
      expect(calculateEstimatedWaitTime(5, 8, 1, 'standard')).toBe(40);
    });

    it('handles zero counters gracefully', () => {
      expect(calculateEstimatedWaitTime(5, 8, 0, 'standard')).toBeGreaterThan(0);
    });
  });

  describe('generateAiQueueInsights', () => {
    beforeAll(() => {
      delete process.env.GEMINI_API_KEY;
    });

    it('generates heuristic insights', async () => {
      const result = await generateAiQueueInsights([], [], []);
      expect(result).toHaveProperty('statusScore');
      expect(result).toHaveProperty('primaryBottleneck');
      expect(result).toHaveProperty('recommendations');
      expect(result).toHaveProperty('predictedPeakHour');
      expect(result).toHaveProperty('aiSummary');
      expect(result.statusScore).toBeGreaterThanOrEqual(1);
      expect(result.statusScore).toBeLessThanOrEqual(100);
      expect(result.recommendations.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('processAiChatQuery', () => {
    beforeAll(() => {
      delete process.env.GEMINI_API_KEY;
    });

    it('responds to wait time query', async () => {
      const result = await processAiChatQuery('how long is the wait');
      expect(result.toLowerCase()).toMatch(/wait|minutes/);
    });

    it('responds to VIP query', async () => {
      const result = await processAiChatQuery('tell me about VIP');
      expect(result.toLowerCase()).toMatch(/vip|priority/);
    });

    it('responds to cancel query', async () => {
      const result = await processAiChatQuery('can I cancel');
      expect(result.toLowerCase()).toMatch(/cancel/);
    });

    it('responds to document query', async () => {
      const result = await processAiChatQuery('what documents do I need');
      expect(result.toLowerCase()).toMatch(/id|document/);
    });

    it('provides default response for unknown queries', async () => {
      const result = await processAiChatQuery('asdfasdf');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
