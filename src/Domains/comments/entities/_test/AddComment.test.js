const AddComment = require('../AddComment');

describe('a AddComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      owner: 'user-123',
      thread: 'thread-123',

    };

    expect(() => new AddComment(payload)).toThrowError('ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      owner: 'user-123',
      thread: 'thread-123',
      content: 123,
    };

    expect(() => new AddComment(payload)).toThrowError('ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create new comment object correctly', () => {
    const payload = {
      owner: 'user-123',
      thread: 'thread-123',
      content: 'sebuah comment',
    };

    const { owner, thread, content } = new AddComment(payload);

    expect(owner).toEqual(payload.owner);
    expect(thread).toEqual(payload.thread);
    expect(content).toEqual(payload.content);
  });
});
