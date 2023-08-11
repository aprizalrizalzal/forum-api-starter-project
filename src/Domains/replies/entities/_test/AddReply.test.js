const AddReply = require('../AddReply');

describe('a AddReply entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      owner: 'user-123',
      thread: 'thread-123',
      comment: 'comment-123',

    };

    expect(() => new AddReply(payload)).toThrowError('ADD_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      owner: 'user-123',
      thread: 'thread-123',
      comment: 'comment-123',
      content: 123,
    };

    expect(() => new AddReply(payload)).toThrowError('ADD_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create new reply object correctly', () => {
    const payload = {
      owner: 'user-123',
      thread: 'thread-123',
      comment: 'comment-123',
      content: 'sebuah balasan',
    };

    const { owner, thread, comment, content } = new AddReply(payload);

    expect(owner).toEqual(payload.owner);
    expect(thread).toEqual(payload.thread);
    expect(comment).toEqual(payload.comment);
    expect(content).toEqual(payload.content);
  });
});
