const { hashSync } = require('bcrypt');
const { v4 } = require('uuid');
const UserDto = require('../dtos/UserDto');

const User = require('../models/User');
const mailService = require('./mailService');
const tokenService = require('./tokenService');

class UserService {
  async registration(email, password) {
    const candidate = await User.findOne({ email });

    if (candidate) {
      throw new Error(`User with this ${email} already exists`);
    }

    const hashPass = hashSync(password, 3);
    const activationLink = v4(); //получаем уникальную строку

    const user = await User.create({ email, password: hashPass, activationLink });
    await mailService.sendActivationMail(email, activationLink);

    const userDto = new UserDto(user); // id, email, isActivated
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return { ...tokens, user: userDto };
  }
}

module.exports = new UserService();
