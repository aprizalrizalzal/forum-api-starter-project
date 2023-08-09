class AuthenticationRepository {
  async addToken(_newToken) {
    throw new Error('AUTHENTICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async checkAvailabilityToken(_token) {
    throw new Error('AUTHENTICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async deleteToken(_token) {
    throw new Error('AUTHENTICATION_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }
}

module.exports = AuthenticationRepository;
