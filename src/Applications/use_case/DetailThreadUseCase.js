const DetailThread = require('../../Domains/threads/entities/DetailThread');
const DetailComment = require('../../Domains/comments/entities/DetailComment');
const DetailReply = require('../../Domains/replies/entities/DetailReply');

class DetailThreadUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    const { thread } = new DetailThread(useCasePayload);
    await this._threadRepository.checkAvailabilityThread(thread);
    const getDetailThread = await this._threadRepository.getDetailThread(thread);
    const getCommentsThread = await this._commentRepository.getCommentsThread(thread);
    const getRepliesThread = await this._replyRepository.getRepliesThread(thread);

    const commentsWithReplies = getCommentsThread.map(comment => {
      const replies = getRepliesThread
        .filter(reply => reply.commentId === comment.id)
        .map(reply => new DetailReply({
          id: reply.id,
          content: reply.deleted_at ? '**balasan telah dihapus**' : reply.content,
          date: reply.date,
          username: reply.username,
        }));

      return {
        ...new DetailComment({ comments: [comment] }).comments[0],
        replies,
      };
    });

    return {
      thread: {
        ...getDetailThread,
        comments: commentsWithReplies,
      },
    };
  }
}

module.exports = DetailThreadUseCase;
