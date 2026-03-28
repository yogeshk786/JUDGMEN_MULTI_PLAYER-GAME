const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  // 1. Check if they handed us a VIP Pass in the headers
  const authHeader = req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: '🛑 Access Denied: No VIP Pass provided!' });
  }

  // 2. Extract the actual token string (Removes the word "Bearer ")
  const token = authHeader.split(' ')[1];

  try {
    // 3. Verify the token using your secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_if_missing');
    
    // 4. Attach the player's info (id, username) to the request!
    // Now, any route after this knows EXACTLY who is making the request.
    req.user = decoded;
    
    // 5. Open the door and let them into the route!
    next();
  } catch (error) {
    return res.status(401).json({ message: '🛑 Access Denied: VIP Pass is invalid or expired!' });
  }
};

module.exports = { protect };