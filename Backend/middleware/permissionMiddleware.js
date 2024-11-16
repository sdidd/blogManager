const permissionMiddleware = (requiredPermissions = []) => async (req, res, next) => {
    try {
      const userPerms = req.user.permissions; // Fetch user's role and permissions
      //console.log(userPerms);
  
      if (!userPerms) {
        return res.status(403).json({ error: 'Forbidden: Role or permissions not found' });
      }
  
      const hasPermission = requiredPermissions.some(permission =>
        userPerms.includes(permission)
      );
  
      if (!hasPermission) {
        return res.status(403).json({ error: 'Forbidden: Access denied' });
      }
  
      next(); // User has permission
    } catch (err) {
      res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
  };
  
module.exports = permissionMiddleware;  