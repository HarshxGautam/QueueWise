const { validateJoinQueue, validateCallNext, validateUpdateStatus, validateChat, validateLogin } = require('../middleware/validate');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = () => jest.fn();

describe('validate middleware', () => {
  describe('validateJoinQueue', () => {
    it('passes with valid data', () => {
      const req = { body: { customerName: 'John', serviceId: 'banking' } };
      const res = mockRes();
      const next = mockNext();
      validateJoinQueue(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('fails without customerName', () => {
      const req = { body: { serviceId: 'banking' } };
      const res = mockRes();
      const next = mockNext();
      validateJoinQueue(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0]).toBeDefined();
    });

    it('fails with short name', () => {
      const req = { body: { customerName: 'J', serviceId: 'banking' } };
      const res = mockRes();
      const next = mockNext();
      validateJoinQueue(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0]).toBeDefined();
    });
  });

  describe('validateCallNext', () => {
    it('passes with valid counterNumber', () => {
      const req = { body: { counterNumber: 1 } };
      const res = mockRes();
      const next = mockNext();
      validateCallNext(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('fails with negative number', () => {
      const req = { body: { counterNumber: -1 } };
      const res = mockRes();
      const next = mockNext();
      validateCallNext(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0]).toBeDefined();
    });
  });

  describe('validateUpdateStatus', () => {
    it('passes with valid data', () => {
      const req = { body: { ticketNumber: 'B-101', status: 'completed' } };
      const res = mockRes();
      const next = mockNext();
      validateUpdateStatus(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('fails with invalid status', () => {
      const req = { body: { ticketNumber: 'B-101', status: 'invalid' } };
      const res = mockRes();
      const next = mockNext();
      validateUpdateStatus(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0]).toBeDefined();
    });
  });

  describe('validateLogin', () => {
    it('passes with credentials', () => {
      const req = { body: { username: 'admin', password: 'pass123' } };
      const res = mockRes();
      const next = mockNext();
      validateLogin(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('fails without password', () => {
      const req = { body: { username: 'admin' } };
      const res = mockRes();
      const next = mockNext();
      validateLogin(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0]).toBeDefined();
    });
  });
});
