import UserLogin from '../../Domains/users/entities/UserLogin.js';
import NewAuthentication from '../../Domains/authentications/entities/NewAuth.js';

class LoginUserUseCase {
  constructor({
    userRepository,
    authenticationRepository,
    authenticationTokenManager,
    passwordHash,
  }) {
    this._userRepository = userRepository;
    this._authenticationRepository = authenticationRepository;
    this._authenticationTokenManager = authenticationTokenManager;
    this._passwordHash = passwordHash;
  }

  async execute(useCasePayload) {
    // Validate login payload
    const { username, password } = new UserLogin(useCasePayload);

    // Get encrypted password from database
    const encryptedPassword =
      await this._userRepository.getPasswordByUsername(username);

    // Compare plain password with encrypted password
    await this._passwordHash.comparePassword(password, encryptedPassword);

    // Get user ID
    const id = await this._userRepository.getIdByUsername(username);

    // Create access token
    const accessToken =
      await this._authenticationTokenManager.createAccessToken({
        username,
        id,
      });

    // Create refresh token
    const refreshToken =
      await this._authenticationTokenManager.createRefreshToken({
        username,
        id,
      });

    // Create authentication entity
    const newAuthentication = new NewAuthentication({
      accessToken,
      refreshToken,
    });

    // Store refresh token
    await this._authenticationRepository.addToken(
      newAuthentication.refreshToken,
    );

    return newAuthentication;
  }
}

export default LoginUserUseCase;
