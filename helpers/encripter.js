import crypto from 'node:crypto'

const algoritmo = 'aes-256-cbc';
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

// console.log(crypto.getCiphers);

const encriptar = (token) => {
    const cipher = crypto.createCipheriv(algoritmo, key, iv);
    const tokenEncripted = Buffer.concat([cipher.update(token), cipher.final()]);
    
    const ivString = iv.toString('hex');
    const keyString = key.toString('hex');
    const encriptedString =  tokenEncripted.toString('hex');

    return `${ivString}-${keyString}-${encriptedString}`;
}

const desencriptar = (encryptedToken) => {
    const encriptedTokenArray = encryptedToken.split('-');
    const ivString = encriptedTokenArray[0];
    const keyString = encriptedTokenArray[1];
    const encriptedToken = encriptedTokenArray[2];

    const iv = Buffer.from(ivString, 'hex');
    const token = Buffer.from(encriptedToken, 'hex');
    const key = Buffer.from(keyString, 'hex');

    const tokenDesencripted = crypto.createDecipheriv(algoritmo, key, iv);

    const tokenBuffer = Buffer.concat([tokenDesencripted.update(token), tokenDesencripted.final()]);

    return tokenBuffer.toString();
}

export {
    encriptar,
    desencriptar
}