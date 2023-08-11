const DetailReply = require('../DetailReply');

describe('a DetailReply entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
    };

    expect(() => new DetailReply(payload)).toThrowError('DETAIL_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      replies: {
      },
    };

    expect(() => new DetailReply(payload)).toThrowError('DETAIL_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should remap replies data correctly', () => {
    const payload = {
      replies: [
        {
          id: 'reply-456',
          username: 'johndoe',
          date: '2021-08-08T07:22:33.555Z',
          content: 'sebuah balasan',
          deleted_at: '',
        },
        {
          id: 'reply-123',
          username: 'dicoding',
          date: '2021-08-08T07:26:21.338Z',
          content: 'balasan yang lain tapi sudah dihapus',
          deleted_at: '2023-08-08T09:23:30.756Z',
        },
      ],
    };

    const { replies } = new DetailReply(payload);

    const expectedReply = [
      {
        id: 'reply-456',
        username: 'johndoe',
        date: '2021-08-08T07:22:33.555Z',
        content: 'sebuah balasan',
      },
      {
        id: 'reply-123',
        username: 'dicoding',
        date: '2021-08-08T07:26:21.338Z',
        content: '**balasan telah dihapus**',
      },
    ];

    expect(replies).toEqual(expectedReply);
  });

  it('should create DetailReply object correctly', () => {
    const payload = {
      replies: [
        {
          id: 'reply-456',
          username: 'johndoe',
          date: '2021-08-08T07:22:33.555Z',
          content: 'sebuah balasan',
        },
        {
          id: 'reply-123',
          username: 'dicoding',
          date: '2021-08-08T07:26:21.338Z',
          content: '**balasan telah dihapus**',
        },
      ],
    };

    const { replies } = new DetailReply(payload);

    expect(replies).toEqual(payload.replies);
  });
});
