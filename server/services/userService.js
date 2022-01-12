const { hashSync, compare } = require('bcrypt');
const { v4 } = require('uuid');

const User = require('../models/User');
const mailService = require('./mailService');
const tokenService = require('./tokenService');
const UserDto = require('../dtos/UserDto');
const ApiError = require('../exceptions/apiError');

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

  async login(email, password) {
    const user = await User.findOne({ email });

    if (!user) {
      throw ApiError.BadRequest('User was not found');
    }

    const isPassEquals = await compare(password, user.password);

    if (!isPassEquals) {
      throw ApiError.BadRequest('Invalid password');
    }

    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return { ...tokens, user: userDto };
  }

  async logout(refreshToken) {
    const token = await tokenService.removeToken(refreshToken);
    return token;
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw ApiError.UnauthorizedError();
    }

    const userData = tokenService.validateRefreshToken(refreshToken);
    const tokenFromDb = await tokenService.findToken(refreshToken);

    if (!userData || !tokenFromDb) {
      throw ApiError.UnauthorizedError();
    }

    const user = await User.findById(userData.id);
    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return { ...tokens, user: userDto };
  }

  async getAllUsers(userId) {
    const user = await User.findOne({ _id: userId });
    console.log('user', user);

    if (!user?.isActivated) {
      throw ApiError.BadRequest('User is not activated');
    }

    const users = await User.find();
    return users;
  }
}

module.exports = new UserService();
