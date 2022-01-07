const { hashSync } = require('bcrypt');
const { v4 } = require('uuid');
const UserDto = require('../dtos/UserDto');
const ApiError = require('../exceptions/apiError');

const User = require('../models/User');
const mailService = require('./mailService');
const tokenService = require('./tokenService');

class UserService {
  async registration(email, password) {
    const candidate = await User.findOne({ email });

    if (candidate) {
      throw ApiError.BadRequest(`User with this ${email} already exists`);
    }

    const hashPass = hashSync(password, 3);

    const linkId = v4(); //получаем уникальную строку
    const activationLink = `${process.env.API_URL}/auth/activate/${linkId}`;

    await mailService.sendActivationMail(email, activationLink);
    const user = await User.create({
      email,
      password: hashPass,
      activationLink: linkId,
    });

    const userDto = new UserDto(user); // id, email, isActivated
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return { ...tokens, user: userDto };
  }

  async activate(activationLink) {
    const user = await User.findOne({ activationLink });

    if (!user) {
      throw ApiError.BadRequest('Incorrect link');
    }

    user.isActivated = true;
    await user.save();
  }
}

module.exports = new UserService();
