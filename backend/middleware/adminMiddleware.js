// middleware/adminMiddleware.js
// `admin` guards routes that only admins may use (managing questions,
// viewing all users/results, ...). It must run AFTER `protect`, because it
// relies on req.user being set. Non-admin users get 403 Forbidden.

function admin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Forbidden — admin access required' });
}

module.exports = admin;
