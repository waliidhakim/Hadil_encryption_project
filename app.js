const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');

require('dotenv').config();

const app = express();
app.use(bodyParser.json());

const algorithm = 'aes-256-cbc';
const serverKey = process.env.SECRET_KEY; 

function encrypt(text, key) {
    console.log(serverKey);
  if (key !== serverKey) {
    throw new Error('Clé incorrecte');
  }

  let iv = crypto.randomBytes(16);
  let cipher = crypto.createCipheriv(algorithm, Buffer.from(crypto.createHash('sha256').update(key).digest()), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text, key) {
  if (key !== serverKey) {
    throw new Error('Clé incorrecte');
  }

  let textParts = text.split(':');
  let iv = Buffer.from(textParts.shift(), 'hex');
  let encryptedText = Buffer.from(textParts.join(':'), 'hex');
  let decipher = crypto.createDecipheriv(algorithm, Buffer.from(crypto.createHash('sha256').update(key).digest()), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});


app.post('/encrypt', (req, res) => {
  const { message, key } = req.body;
  try {
    const encryptedMessage = encrypt(message, key);
    res.send(encryptedMessage);
  } catch (e) {
    res.status(401).send(e.message);
  }
});

app.post('/decrypt', (req, res) => {
  const { message, key } = req.body;
  try {
    const decryptedMessage = decrypt(message, key);
    res.send(decryptedMessage);
  } catch (e) {
    res.status(401).send(e.message);
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
