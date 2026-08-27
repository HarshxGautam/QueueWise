const router = require('express').Router();
const Service = require('../models/Service');
const Ticket = require('../models/Ticket');
const db = require('../utils/db');

router.get('/', async (req, res, next) => {
  try {
    if (db.isDbConnected) {
      const services = await Service.find();
      const waitingTickets = await Ticket.find({ status: "waiting" });
      const servicesWithCounts = services.map(s => {
        const count = waitingTickets.filter(t => t.serviceId === s.serviceId).length;
        return { ...s.toObject(), waitingCount: count };
      });
      return res.json(servicesWithCounts);
    }

    // In-memory fallback
    const inMemoryStore = db.inMemoryStore;
    const waitingTickets = inMemoryStore.tickets.filter(t => t.status === "waiting");
    const servicesWithCounts = inMemoryStore.services.map(s => {
      const count = waitingTickets.filter(t => t.serviceId === s.serviceId).length;
      return { ...s, waitingCount: count };
    });
    res.json(servicesWithCounts);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
