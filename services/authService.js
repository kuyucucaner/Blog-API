const jwt = require('jsonwebtoken');

const authService = {
  authenticateToken: (req, res, next) => {
    const token = req.headers['authorization'].replace('Bearer ', '');
    console.log("Received Token:", token);
    if (!token) {
      // Verbose log: Token olmadan gelen isteği konsola yazdır
      console.log('Unauthorized Request: Token is missing');
      return res.status(401).json({ message: 'Unauthorized' });
    }
    // Token'ı doğrula
    jwt.verify(token, 'monster', (err, decodedUser) => {
      if (err) {
        // Verbose log: JWT doğrulama hatasını konsola yazdır
        console.error('JWT Verification Error:', err);
        return res.status(403).json({ message: 'Forbidden', error: err.message });
      }
      // Verbose log: Token başarıyla doğrulandı
      console.log('Token Verified:', decodedUser);
      // Kullanıcı bilgisini request nesnesine ekle
      req.user = decodedUser;
      // İleriye yönlendir
      next();
    });
  },
};

module.exports = authService;
