const DetailThreadUseCase = require('../DetailThreadUseCase');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('DetailThreadUseCase', () => {
  it('should get return detail thread correctly', async () => {
    const useCasePayload = {
      thread: 'thread-123',
    };

    const expectedThread = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
    };

    const expectedComment = [
      {
        id: 'comment-123',
        thread: 'thread-123',
        username: 'johndoe',
        date: '2021-08-08T07:22:33.555Z',
        content: 'sebuah komentar',
        deleted_at: '',
      },
      {
        id: 'comment-456',
        thread: 'thread-123',
        username: 'dicoding',
        date: '2021-08-08T07:26:21.338Z',
        content: 'komentar yang lain tapi sudah dihapus',
        deleted_at: '2023-08-08T09:23:30.756Z',
      },
    ];

    const expectedReply = [
      {
        id: 'reply-123',
        comment: 'comment-123',
        username: 'johndoe',
        date: '2021-08-08T07:22:33.555Z',
        content: 'sebuah balasan',
        deleted_at: '',
      },
      {
        id: 'reply-456',
        comment: 'comment-123',
        username: 'dicoding',
        date: '2021-08-08T07:26:21.338Z',
        content: 'balasan yang lain tapi sudah dihapus',
        deleted_at: '2023-08-08T09:23:30.756Z',
      },
    ];

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.checkAvailabilityThread = jest.fn(() => Promise.resolve());

    mockThreadRepository.getDetailThread = jest.fn(() => Promise.resolve(expectedThread));
    mockCommentRepository.getCommentsThread = jest.fn(() => Promise.resolve(expectedComment));
    mockReplyRepository.getRepliesThread = jest.fn(() => Promise.resolve(expectedReply));

    const detailThreadUseCase = new DetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    const detailThread = await detailThreadUseCase.execute(useCasePayload);

    expect(mockThreadRepository.checkAvailabilityThread).toHaveBeenCalledWith(useCasePayload.thread);
    expect(mockThreadRepository.getDetailThread).toHaveBeenCalledWith(useCasePayload.thread);
    expect(mockCommentRepository.getCommentsThread).toHaveBeenCalledWith(useCasePayload.thread);
    expect(mockReplyRepository.getRepliesThread).toHaveBeenCalledWith(useCasePayload.thread);

    expect(detailThread).toStrictEqual({
      thread: {
        id: 'thread-123',
        title: 'sebuah thread',
        body: 'sebuah body thread',
        date: '2021-08-08T07:19:09.775Z',
        username: 'dicoding',
        comments: [
          {
            id: 'comment-123',
            username: 'johndoe',
            date: '2021-08-08T07:22:33.555Z',
            replies: [
              {
                id: "reply-123",
                content: "sebuah balasan",
                date: "2021-08-08T07:22:33.555Z",
                username: "johndoe"
              },
              {
                id: "reply-456",
                content: "**balasan telah dihapus**",
                date: "2021-08-08T07:26:21.338Z",
                username: "dicoding"
              },
            ],
            content: 'sebuah komentar',
          },
          {
            id: 'comment-456',
            username: 'dicoding',
            date: '2021-08-08T07:26:21.338Z',
            replies: [],
            content: '**komentar telah dihapus**',
          },
        ],
      },
    });
  });
});
