const DeleteCommentUseCase = require('../DeleteCommentUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('DeleteCommentUseCase', () => {
  it('should throw error if use case payload not contain thread id and comment id', async () => {
    const useCasePayload = {};
    const deleteCommentUseCase = new DeleteCommentUseCase({});

    await expect(deleteCommentUseCase.execute(useCasePayload)).rejects.toThrowError('DELETE_COMMENT_USE_CASE.NOT_CONTAIN_VALID_PAYLOAD');
  });

  it('should throw error if payload not string', async () => {
    const useCasePayload = {
      thread: 123,
      comment: 123,
      owner: 123,
    };
    const deleteCommentUseCase = new DeleteCommentUseCase({});
    await expect(deleteCommentUseCase.execute(useCasePayload)).rejects.toThrowError('DELETE_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should orchestrating the delete comment action correctly', async () => {
    const useCasePayload = {
      thread: 'thread-123',
      comment: 'comment-123',
      owner: 'user-123',
    };

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.checkAvailabilityThread = jest.fn(() => Promise.resolve());
    mockCommentRepository.checkAvailabilityComment = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyCommentOwner = jest.fn(() => Promise.resolve());
    mockCommentRepository.deleteComment = jest.fn(() => Promise.resolve());

    const deleteCommentUseCase = new DeleteCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    await deleteCommentUseCase.execute(useCasePayload);

    expect(mockThreadRepository.checkAvailabilityThread)
      .toHaveBeenCalledWith(useCasePayload.thread);
    expect(mockCommentRepository.checkAvailabilityComment)
      .toHaveBeenCalledWith(useCasePayload.comment);
    expect(mockCommentRepository.verifyCommentOwner)
      .toHaveBeenCalledWith(useCasePayload.comment, useCasePayload.owner);
    expect(mockCommentRepository.deleteComment).toHaveBeenCalledWith(useCasePayload.comment);
  });
});
