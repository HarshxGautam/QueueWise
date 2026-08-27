const router = require('express').Router();
const Ticket = require('../models/Ticket');
const Service = require('../models/Service');
const Counter = require('../models/Counter');
const { generateAiQueueInsights, processAiChatQuery } = require('../services/aiService');
const db = require('../utils/db');
const { verifyToken } = require('../middleware/auth');
const { validateChat } = require('../middleware/validate');

router.get('/insights', verifyToken, async (req, res, next) => {
  try {
    const inMemoryStore = db.inMemoryStore;
    const tickets = db.isDbConnected ? await Ticket.find() : inMemoryStore.tickets;
    const services = db.isDbConnected ? await Service.find() : inMemoryStore.services;
    const counters = db.isDbConnected ? await Counter.find() : inMemoryStore.counters;

    const insights = await generateAiQueueInsights(services, tickets, counters);
    res.json(insights);
  } catch (err) {
    next(err);
  }
});

router.post('/chat', validateChat, async (req, res, next) => {
  try {
    const { message, ticketContext } = req.body;
    const reply = await processAiChatQuery(message, ticketContext);
    res.json({ reply });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
