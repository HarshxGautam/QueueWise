const jwt = require('jsonwebtoken');
process.env.JWT_SECRET = 'test_secret';
const { verifyToken, requireRole } = require('../middleware/auth');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = () => jest.fn();

describe('auth middleware', () => {
  const secret = process.env.JWT_SECRET || 'test_secret';
  
  beforeAll(() => {
    process.env.JWT_SECRET = secret;
  });

  describe('verifyToken', () => {
    it('passes with valid token', () => {
      const token = jwt.sign({ id: '123', role: 'admin' }, secret, { expiresIn: '1h' });
      const req = { headers: { authorization: `Bearer ${token}` } };
      const res = mockRes();
      const next = mockNext();
      
      verifyToken(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user.id).toBe('123');
    });

    it('rejects request without token', () => {
      const req = { headers: {} };
      const res = mockRes();
      const next = mockNext();
      
      verifyToken(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('rejects request with invalid token', () => {
      const req = { headers: { authorization: 'Bearer invalid_token_string' } };
      const res = mockRes();
      const next = mockNext();
      
      verifyToken(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(next.mock.calls[0][0].name).toBe('JsonWebTokenError');
    });

    it('rejects expired token', () => {
      const token = jwt.sign({ id: '123', role: 'admin' }, secret, { expiresIn: '0s' });
      const req = { headers: { authorization: `Bearer ${token}` } };
      const res = mockRes();
      const next = mockNext();
      
      verifyToken(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    });
  });

  describe('requireRole', () => {
    it('allows matching role', () => {
      const req = { user: { role: 'admin' } };
      const res = mockRes();
      const next = mockNext();
      
      requireRole('admin')(req, res, next);
      
      expect(next).toHaveBeenCalled();
    });

    it('rejects non-matching role', () => {
      const req = { user: { role: 'staff' } };
      const res = mockRes();
      const next = mockNext();
      
      requireRole('admin')(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('allows any of multiple roles', () => {
      const req = { user: { role: 'staff' } };
      const res = mockRes();
      const next = mockNext();
      
      requireRole('admin', 'staff')(req, res, next);
      
      expect(next).toHaveBeenCalled();
    });
  });
});
