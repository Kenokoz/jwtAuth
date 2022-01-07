const { sign } = require('jsonwebtoken');
const Token = require('../models/Token');

class TokenService {
  generateTokens(payload) {
    const accessToken = sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '30m' });
    const refreshToken = sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });

    return { accessToken, refreshToken };
  }

  async saveToken(userId, refreshToken) {
    // такой способ будет выбрасывать с аккаунта, если вход был осуществлен с другого устройства
    const tokenData = await Token.findOne({ user: userId });
    if (tokenData) {
      tokenData.refreshToken = refreshToken;
      return tokenData.save();
    }

    const token = await Token.create({ user: userId, refreshToken });
    return token;
  }
}

module.exports = new TokenService();
