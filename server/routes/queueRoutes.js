const router = require('express').Router();
const Ticket = require('../models/Ticket');
const Service = require('../models/Service');
const Counter = require('../models/Counter');
const { calculateEstimatedWaitTime } = require('../services/aiService');
const db = require('../utils/db');
const { validateJoinQueue, validateCallNext, validateUpdateStatus } = require('../middleware/validate');
const { verifyToken } = require('../middleware/auth');

module.exports = (io) => {
  // Join Virtual Queue (Create Ticket)
  router.post('/join', validateJoinQueue, async (req, res, next) => {
    try {
      const { customerName, phone, serviceId, priority } = req.body;
      const finalPriority = priority || "standard";

      if (db.isDbConnected) {
        const service = await Service.findOne({ serviceId });
        if (!service) return res.status(404).json({ error: "Service category not found." });

        const existingWaiting = await Ticket.find({ serviceId, status: "waiting" });
        const position = existingWaiting.length + 1;
        const prefix = service.prefix || "Q";
        const totalTicketCount = await Ticket.countDocuments();
        const ticketSeq = 101 + (totalTicketCount % 900);
        const ticketNumber = `${prefix}-${ticketSeq}`;

        const activeCounters = await Counter.countDocuments({ status: "active", assignedServices: serviceId });
        const estWaitMins = calculateEstimatedWaitTime(existingWaiting.length, service.avgDurationMins, activeCounters || 1, finalPriority);

        const newTicket = new Ticket({
          ticketNumber,
          customerName,
          phone: phone || "",
          serviceId,
          serviceName: service.name,
          status: "waiting",
          priority: finalPriority,
          position,
          estimatedWaitMins: estWaitMins,
          aiNotes: finalPriority === "vip" ? "Priority VIP Routing Applied" : "Standard Queue Routing"
        });

        await newTicket.save();
        io.emit('queue:updated');
        return res.status(201).json({ message: "Ticket generated successfully", ticket: newTicket });
      }

      // In-memory fallback
      const inMemoryStore = db.inMemoryStore;
      const service = inMemoryStore.services.find(s => s.serviceId === serviceId);
      if (!service) return res.status(404).json({ error: "Service category not found." });

      const existingWaiting = inMemoryStore.tickets.filter(t => t.serviceId === serviceId && t.status === "waiting");
      const position = existingWaiting.length + 1;
      const prefix = service.prefix || "Q";
      const ticketSeq = 101 + (inMemoryStore.tickets.length % 900);
      const ticketNumber = `${prefix}-${ticketSeq}`;

      const activeCounters = inMemoryStore.counters.filter(c => c.status === "active" && c.assignedServices.includes(serviceId)).length;
      const estWaitMins = calculateEstimatedWaitTime(existingWaiting.length, service.avgDurationMins, activeCounters || 1, finalPriority);

      const newTicket = {
        ticketNumber,
        customerName,
        phone: phone || "",
        serviceId,
        serviceName: service.name,
        status: "waiting",
        priority: finalPriority,
        position,
        estimatedWaitMins: estWaitMins,
        counterId: null,
        counterNumber: null,
        joinedAt: new Date(),
        aiNotes: finalPriority === "vip" ? "Priority VIP Routing Applied" : "Standard Queue Routing"
      };

      inMemoryStore.tickets.push(newTicket);
      io.emit('queue:updated');
      res.status(201).json({ message: "Ticket generated successfully", ticket: newTicket });
    } catch (err) {
      next(err);
    }
  });

  // Get Ticket Status by Ticket Number
  router.get('/ticket/:ticketNumber', async (req, res, next) => {
    try {
      const { ticketNumber } = req.params;

      if (db.isDbConnected) {
        const ticket = await Ticket.findOne({ ticketNumber });
        if (!ticket) return res.status(404).json({ error: "Ticket not found." });

        if (ticket.status === "waiting") {
          const aheadCount = await Ticket.countDocuments({
            serviceId: ticket.serviceId,
            status: "waiting",
            joinedAt: { $lt: ticket.joinedAt }
          });
          ticket.position = aheadCount + 1;
        }
        return res.json(ticket);
      }

      // In-memory fallback
      const inMemoryStore = db.inMemoryStore;
      const ticket = inMemoryStore.tickets.find(t => t.ticketNumber === ticketNumber);
      if (!ticket) return res.status(404).json({ error: "Ticket not found." });

      if (ticket.status === "waiting") {
        const aheadCount = inMemoryStore.tickets.filter(t => t.serviceId === ticket.serviceId && t.status === "waiting" && new Date(t.joinedAt) < new Date(ticket.joinedAt)).length;
        ticket.position = aheadCount + 1;
      }
      res.json(ticket);
    } catch (err) {
      next(err);
    }
  });

  // Admin / Staff Dashboard Data
  router.get('/admin', async (req, res, next) => {
    try {
      if (db.isDbConnected) {
        const tickets = await Ticket.find().sort({ joinedAt: -1 }).limit(100);
        const counters = await Counter.find().sort({ counterNumber: 1 });
        const services = await Service.find();

        const waitingCount = tickets.filter(t => t.status === "waiting").length;
        const inServiceCount = tickets.filter(t => t.status === "in-service").length;
        const completedTodayCount = tickets.filter(t => t.status === "completed").length;

        return res.json({
          summary: {
            totalWaiting: waitingCount,
            totalInService: inServiceCount,
            completedToday: completedTodayCount,
            activeCounters: counters.filter(c => c.status === "active").length
          },
          tickets,
          counters,
          services
        });
      }

      // In-memory fallback
      const inMemoryStore = db.inMemoryStore;
      const tickets = [...inMemoryStore.tickets].sort((a, b) => new Date(b.joinedAt) - new Date(a.joinedAt));
      const waitingCount = tickets.filter(t => t.status === "waiting").length;
      const inServiceCount = tickets.filter(t => t.status === "in-service").length;
      const completedTodayCount = tickets.filter(t => t.status === "completed").length;

      res.json({
        summary: {
          totalWaiting: waitingCount,
          totalInService: inServiceCount,
          completedToday: completedTodayCount,
          activeCounters: inMemoryStore.counters.filter(c => c.status === "active").length
        },
        tickets,
        counters: inMemoryStore.counters,
        services: inMemoryStore.services
      });
    } catch (err) {
      next(err);
    }
  });

  // Call Next Ticket for a Counter
  router.post('/call-next', verifyToken, validateCallNext, async (req, res, next) => {
    try {
      let { counterNumber } = req.body;

      // Enforce counter ownership for staff members
      if (req.user && req.user.role === 'staff' && req.user.counterNumber) {
        if (Number(counterNumber) !== Number(req.user.counterNumber)) {
          return res.status(403).json({ 
            error: `Access Denied: You are assigned to Counter #${req.user.counterNumber} (${req.user.name}) and cannot operate Counter #${counterNumber}.` 
          });
        }
      }

      if (db.isDbConnected) {
        const counter = await Counter.findOne({ counterNumber });
        if (!counter) return res.status(404).json({ error: "Counter not found." });

        if (counter.currentTicket) {
          const activeT = await Ticket.findOne({ ticketNumber: counter.currentTicket, status: "in-service" });
          if (activeT) {
            return res.status(400).json({ error: `Counter #${counterNumber} is currently serving ${counter.currentTicket}. Complete or cancel current ticket first.` });
          }
        }

        const query = { status: "waiting", serviceId: { $in: counter.assignedServices } };
        let nextTicket = await Ticket.findOne({ ...query, priority: "vip" }).sort({ joinedAt: 1 });
        if (!nextTicket) {
          nextTicket = await Ticket.findOne(query).sort({ joinedAt: 1 });
        }

        if (!nextTicket) {
          return res.json({ message: "No customers currently waiting for your assigned services.", ticket: null });
        }

        nextTicket.status = "in-service";
        nextTicket.counterId = counter._id.toString();
        nextTicket.counterNumber = counter.counterNumber;
        nextTicket.startedAt = new Date();
        await nextTicket.save();

        counter.currentTicket = nextTicket.ticketNumber;
        await counter.save();

        io.emit('ticket:called', { ticket: nextTicket });
        return res.json({ message: `Called ticket ${nextTicket.ticketNumber}`, ticket: nextTicket });
      }

      // In-memory fallback
      const inMemoryStore = db.inMemoryStore;
      const counter = inMemoryStore.counters.find(c => c.counterNumber === Number(counterNumber));
      if (!counter) return res.status(404).json({ error: "Counter not found." });

      if (counter.currentTicket) {
        const activeT = inMemoryStore.tickets.find(t => t.ticketNumber === counter.currentTicket && t.status === "in-service");
        if (activeT) {
          return res.status(400).json({ error: `Counter #${counterNumber} is currently serving ${counter.currentTicket}. Complete or cancel current ticket first.` });
        }
      }

      const waitingList = inMemoryStore.tickets.filter(t => t.status === "waiting" && counter.assignedServices.includes(t.serviceId));
      let nextTicket = waitingList.find(t => t.priority === "vip");
      if (!nextTicket) {
        nextTicket = waitingList[0];
      }

      if (!nextTicket) {
        return res.json({ message: "No customers currently waiting for your assigned services.", ticket: null });
      }

      nextTicket.status = "in-service";
      nextTicket.counterNumber = counter.counterNumber;
      nextTicket.startedAt = new Date();

      counter.currentTicket = nextTicket.ticketNumber;
      
      io.emit('ticket:called', { ticket: nextTicket });
      res.json({ message: `Called ticket ${nextTicket.ticketNumber}`, ticket: nextTicket });
    } catch (err) {
      next(err);
    }
  });

  // Complete or Update Ticket Status
  router.post('/update-status', verifyToken, validateUpdateStatus, async (req, res, next) => {
    try {
      const { ticketNumber, status, feedback, rating } = req.body;
      let counterNumber = req.body.counterNumber;

      // Enforce counter ownership for staff members
      if (req.user && req.user.role === 'staff' && req.user.counterNumber) {
        if (counterNumber && Number(counterNumber) !== Number(req.user.counterNumber)) {
          return res.status(403).json({ 
            error: `Access Denied: You are assigned to Counter #${req.user.counterNumber} (${req.user.name}) and cannot operate Counter #${counterNumber}.` 
          });
        }
        counterNumber = req.user.counterNumber;
      }

      if (db.isDbConnected) {
        const ticket = await Ticket.findOne({ ticketNumber });
        if (!ticket) return res.status(404).json({ error: "Ticket not found." });

        // If ticket is already in-service by another counter, staff cannot interfere
        if (req.user && req.user.role === 'staff' && ticket.counterNumber && ticket.counterNumber !== req.user.counterNumber && ticket.status === "in-service") {
          return res.status(403).json({ 
            error: `Access Denied: Ticket ${ticketNumber} is currently assigned to Counter #${ticket.counterNumber}. You can only manage tickets assigned to your Counter #${req.user.counterNumber}.` 
          });
        }

        const targetCounterNum = counterNumber || ticket.counterNumber;

        ticket.status = status;

        if (status === "in-service") {
          ticket.startedAt = ticket.startedAt || new Date();
          if (targetCounterNum) {
            ticket.counterNumber = Number(targetCounterNum);
            // Clear previous ticket on this counter if any
            await Counter.updateOne({ counterNumber: Number(targetCounterNum) }, { $set: { currentTicket: ticket.ticketNumber } });
          }
        } else if (status === "completed") {
          ticket.completedAt = new Date();
          if (feedback) ticket.feedback = feedback;
          if (rating) ticket.rating = rating;
          if (targetCounterNum) {
            await Counter.updateOne({ counterNumber: Number(targetCounterNum) }, { $inc: { servedTodayCount: 1 }, $set: { currentTicket: null } });
          }
          await Counter.updateMany({ currentTicket: ticketNumber }, { $set: { currentTicket: null } });
        } else if (status === "cancelled" || status === "no-show") {
          if (targetCounterNum) {
            await Counter.updateOne({ counterNumber: Number(targetCounterNum) }, { $set: { currentTicket: null } });
          }
          await Counter.updateMany({ currentTicket: ticketNumber }, { $set: { currentTicket: null } });
        }

        await ticket.save();
        io.emit('queue:updated');
        return res.json({ message: `Ticket status updated to ${status}`, ticket });
      }

      // In-memory fallback
      const inMemoryStore = db.inMemoryStore;
      const ticket = inMemoryStore.tickets.find(t => t.ticketNumber === ticketNumber);
      if (!ticket) return res.status(404).json({ error: "Ticket not found." });

      // If ticket is already in-service by another counter, staff cannot interfere
      if (req.user && req.user.role === 'staff' && ticket.counterNumber && ticket.counterNumber !== req.user.counterNumber && ticket.status === "in-service") {
        return res.status(403).json({ 
          error: `Access Denied: Ticket ${ticketNumber} is currently assigned to Counter #${ticket.counterNumber}. You can only manage tickets assigned to your Counter #${req.user.counterNumber}.` 
        });
      }

      const targetCounterNum = counterNumber || ticket.counterNumber;

      ticket.status = status;

      if (status === "in-service") {
        ticket.startedAt = ticket.startedAt || new Date();
        if (targetCounterNum) {
          ticket.counterNumber = Number(targetCounterNum);
          const cObj = inMemoryStore.counters.find(c => c.counterNumber === Number(targetCounterNum));
          if (cObj) cObj.currentTicket = ticket.ticketNumber;
        }
      } else if (status === "completed") {
        ticket.completedAt = new Date();
        if (feedback) ticket.feedback = feedback;
        if (rating) ticket.rating = rating;
        const cObj = inMemoryStore.counters.find(c => c.counterNumber === Number(targetCounterNum) || c.currentTicket === ticketNumber);
        if (cObj) {
          cObj.servedTodayCount = (cObj.servedTodayCount || 0) + 1;
          cObj.currentTicket = null;
        }
      } else if (status === "cancelled" || status === "no-show") {
        const cObj = inMemoryStore.counters.find(c => c.counterNumber === Number(targetCounterNum) || c.currentTicket === ticketNumber);
        if (cObj) cObj.currentTicket = null;
      }

      io.emit('queue:updated');
      res.json({ message: `Ticket status updated to ${status}`, ticket });
    } catch (err) {
      next(err);
    }
  });

  // Submit Customer Feedback & Rating Endpoint
  router.post('/feedback', async (req, res, next) => {
    try {
      const { ticketNumber, rating, comment } = req.body;
      if (!ticketNumber) return res.status(400).json({ error: "Ticket number is required." });

      const finalRating = Number(rating) || 5;

      if (db.isDbConnected) {
        const ticket = await Ticket.findOne({ ticketNumber });
        if (!ticket) return res.status(404).json({ error: "Ticket not found." });
        ticket.rating = finalRating;
        if (comment) ticket.feedback = comment;
        await ticket.save();
        io.emit('queue:updated');
        return res.json({ message: "Feedback submitted successfully!", ticket });
      }

      // In-memory fallback
      const inMemoryStore = db.inMemoryStore;
      const ticket = inMemoryStore.tickets.find(t => t.ticketNumber === ticketNumber);
      if (!ticket) return res.status(404).json({ error: "Ticket not found." });
      ticket.rating = finalRating;
      if (comment) ticket.feedback = comment;
      io.emit('queue:updated');
      res.json({ message: "Feedback submitted successfully!", ticket });
    } catch (err) {
      next(err);
    }
  });

  // Seed Demo Queue Data
  router.post('/seed', async (req, res, next) => {
    try {
      const demoNames = [
        { name: "Aarav Sharma", service: "placement", priority: "vip", activeAtCounter: 1 },
        { name: "Ananya Iyer", service: "academic", priority: "standard", activeAtCounter: 2 },
        { name: "Rohan Mehta", service: "it-helpdesk", priority: "standard", activeAtCounter: 3 },
        { name: "Pooja Gupta", service: "student-services", priority: "vip", activeAtCounter: 4 },
        { name: "Vikram Singh", service: "placement", priority: "standard" },
        { name: "Sneha Reddy", service: "academic", priority: "standard" },
        { name: "Kabir Verma", service: "it-helpdesk", priority: "vip" },
        { name: "Meera Nair", service: "student-services", priority: "standard" },
        { name: "Siddharth Joshi", service: "placement", priority: "standard" },
        { name: "Riya Patel", service: "academic", priority: "vip" }
      ];

      const completedPastDemo = [
        { name: "Kunal Deshmukh", service: "placement", priority: "standard", counter: 1, rating: 5, feedback: "Resume reviewed thoroughly, got great tips!" },
        { name: "Tanvi Roy", service: "student-services", priority: "vip", counter: 4, rating: 5, feedback: "Received Bonafide certificate in 2 mins." },
        { name: "Aditya Bhatia", service: "it-helpdesk", priority: "standard", counter: 3, rating: 4, feedback: "Wi-Fi MAC registered smoothly." },
        { name: "Deepika Sen", service: "academic", priority: "standard", counter: 2, rating: 5, feedback: "Course credit transfer explained clearly." }
      ];

      if (db.isDbConnected) {
        await Ticket.deleteMany({});
        const services = await Service.find();
        const seeded = [];
        const counters = await Counter.find();
        
        // Reset counters
        for (const c of counters) {
          c.currentTicket = null;
          c.servedTodayCount = 1;
          await c.save();
        }

        // 1. Add completed past demo records with ratings
        for (let j = 0; j < completedPastDemo.length; j++) {
          const item = completedPastDemo[j];
          const serv = services.find(s => s.serviceId === item.service) || services[0];
          const t = new Ticket({
            ticketNumber: `${serv.prefix || 'P'}-${90 + j}`,
            customerName: item.name,
            serviceId: serv.serviceId,
            serviceName: serv.name,
            status: "completed",
            priority: item.priority,
            position: 0,
            estimatedWaitMins: 0,
            counterNumber: item.counter,
            rating: item.rating,
            feedback: item.feedback,
            joinedAt: new Date(Date.now() - (60 - j * 10) * 60000),
            completedAt: new Date(Date.now() - (45 - j * 10) * 60000)
          });
          await t.save();
          seeded.push(t);
        }

        // 2. Add active 10 tickets
        for (let i = 0; i < demoNames.length; i++) {
          const item = demoNames[i];
          const serv = services.find(s => s.serviceId === item.service) || services[0];
          const isServing = !!item.activeAtCounter;
          const ticketNumber = `${serv.prefix || 'P'}-${101 + i}`;
          
          const t = new Ticket({
            ticketNumber,
            customerName: item.name,
            serviceId: serv.serviceId,
            serviceName: serv.name,
            status: isServing ? "in-service" : "waiting",
            priority: item.priority,
            position: isServing ? 0 : i - 3,
            estimatedWaitMins: isServing ? 0 : (i - 3) * 5,
            counterNumber: item.activeAtCounter || null,
            joinedAt: new Date(Date.now() - (20 - i) * 60000)
          });
          await t.save();
          seeded.push(t);

          if (isServing) {
            const cObj = counters.find(c => c.counterNumber === item.activeAtCounter);
            if (cObj) {
              cObj.currentTicket = ticketNumber;
              await cObj.save();
            }
          }
        }
        io.emit('queue:updated');
        return res.json({ message: "10 Demo campus tickets created in MongoDB!", seeded });
      }

      // In-memory seed
      const inMemoryStore = db.inMemoryStore;
      inMemoryStore.tickets = [];
      
      // Reset counter active tickets
      inMemoryStore.counters.forEach(c => {
        c.currentTicket = null;
        c.servedTodayCount = 1;
      });

      const seeded = [];

      // 1. Add completed past demo records with ratings
      completedPastDemo.forEach((item, j) => {
        const serv = inMemoryStore.services.find(s => s.serviceId === item.service) || inMemoryStore.services[0];
        const t = {
          ticketNumber: `${serv.prefix || 'P'}-${90 + j}`,
          customerName: item.name,
          serviceId: serv.serviceId,
          serviceName: serv.name,
          status: "completed",
          priority: item.priority,
          position: 0,
          estimatedWaitMins: 0,
          counterNumber: item.counter,
          rating: item.rating,
          feedback: item.feedback,
          joinedAt: new Date(Date.now() - (60 - j * 10) * 60000),
          completedAt: new Date(Date.now() - (45 - j * 10) * 60000)
        };
        inMemoryStore.tickets.push(t);
        seeded.push(t);
      });

      // 2. Add active 10 tickets
      demoNames.forEach((item, i) => {
        const serv = inMemoryStore.services.find(s => s.serviceId === item.service) || inMemoryStore.services[0];
        const isServing = !!item.activeAtCounter;
        const ticketNumber = `${serv.prefix || 'P'}-${101 + i}`;

        const t = {
          ticketNumber,
          customerName: item.name,
          serviceId: serv.serviceId,
          serviceName: serv.name,
          status: isServing ? "in-service" : "waiting",
          priority: item.priority,
          position: isServing ? 0 : Math.max(1, i - 3),
          estimatedWaitMins: isServing ? 0 : Math.max(2, (i - 3) * 5),
          counterNumber: item.activeAtCounter || null,
          joinedAt: new Date(Date.now() - (20 - i) * 60000)
        };
        inMemoryStore.tickets.push(t);
        seeded.push(t);

        if (isServing) {
          const cObj = inMemoryStore.counters.find(c => c.counterNumber === item.activeAtCounter);
          if (cObj) {
            cObj.currentTicket = ticketNumber;
          }
        }
      });

      io.emit('queue:updated');
      res.json({ message: "Demo tickets created in memory store!", seeded });
    } catch (err) {
      next(err);
    }
  });

  return router;
};
