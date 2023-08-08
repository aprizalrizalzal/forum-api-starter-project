const AddThread = require('../AddThread');

describe('a AddThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      title: 'sebuah threads',
      body: 'sebuah body threads',
    };

    expect(() => new AddThread(payload)).toThrowError('ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      title: 'sebuah threads',
      body: 123,
      owner: 'user-123',
    };

    expect(() => new AddThread(payload)).toThrowError('ADD_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error when title contains more than 150 character', () => {
    const payload = {
      title: 'sebuah threads sebuah threads sebuah threads sebuah threads sebuah threads sebuah threads sebuah threads sebuah threads sebuah threads sebuah threads sebuah threads',
      body: 'sebuah body threads',
      owner: 'user-123',
    };

    expect(() => new AddThread(payload)).toThrowError('ADD_THREAD.TITLE_CONTAINS_MORE_THEN_150_CHARACTER');
  });

  it('should create new thread object correctly', () => {
    const payload = {
      title: 'sebuah thread',
      body: 'sebuah body threads',
      owner: 'user-123',
    };

    const { title, body, owner } = new AddThread(payload);

    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
    expect(owner).toEqual(payload.owner);
  });
});