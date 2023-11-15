const NodeRSA = require('node-rsa');
const fs = require('fs');
const path = require('path');

let key;
const publicKeyPath = path.join(__dirname, 'keys', 'publicKey.pem');
const privateKeyPath = path.join(__dirname, 'keys', 'privateKey.pem');

if (fs.existsSync(publicKeyPath) && fs.existsSync(privateKeyPath)) {
  
  const publicKey = fs.readFileSync(publicKeyPath, 'utf8');
  const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
  key = new NodeRSA(privateKey);
  key.importKey(publicKey, 'public');
} else {
  
  key = new NodeRSA({ b: 512 });
  fs.mkdirSync(path.join(__dirname, 'keys'), { recursive: true });
  fs.writeFileSync(publicKeyPath, key.exportKey('public'));
  fs.writeFileSync(privateKeyPath, key.exportKey('private'));
}
const rsaController = {
  encrypt: function (message) {
    return key.encrypt(message, 'base64');
  },
  decrypt: function (encryptedMessage) {
    return key.decrypt(encryptedMessage, 'utf8');
  }
};

module.exports = rsaController;