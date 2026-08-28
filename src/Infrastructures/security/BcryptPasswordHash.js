import PasswordHash from '../../Applications/security/PasswordHash.js';
import AuthenticationError from '../../Commons/exceptions/AuthenticationError.js';

class BcryptPasswordHash extends PasswordHash {
  constructor(bcrypt, saltRound = 10) {
    super();

    this._bcrypt = bcrypt;
    this._saltRound = saltRound;
  }

  async hash(password) {
    return this._bcrypt.hash(password, this._saltRound);
  }

  async comparePassword(password, encryptedPassword) {
    const match = await this._bcrypt.compare(password, encryptedPassword);

    if (!match) {
      throw new AuthenticationError('kredensial yang Anda masukkan salah');
    }
  }

  async compare(password, encryptedPassword) {
    return this.comparePassword(password, encryptedPassword);
  }
}

export default BcryptPasswordHash;
