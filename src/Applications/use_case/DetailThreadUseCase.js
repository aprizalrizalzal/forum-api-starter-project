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
      const relatedReplies = getRepliesThread.filter(reply => reply.comment === comment.id);
      const replies = relatedReplies.map(reply => {
        return {
          id: reply.id,
          username: reply.username,
          date: reply.date,
          content: reply.deleted_at ? '**balasan telah dihapus**' : reply.content,
        };
      });

      if (replies.length > 0) {
        return {
          id: comment.id,
          username: comment.username,
          date: comment.date,
          replies: replies,
          content: comment.deleted_at ? '**komentar telah dihapus**' : comment.content,
        };
      } else {

        return {
          id: comment.id,
          username: comment.username,
          date: comment.date,
          content: comment.deleted_at ? '**komentar telah dihapus**' : comment.content,
        };
      }
    });

    return {
      thread: {
        id: getDetailThread.id,
        title: getDetailThread.title,
        body: getDetailThread.body,
        date: getDetailThread.date,
        username: getDetailThread.username,
        comments: commentsWithReplies,
      },
    };
  }
}

module.exports = DetailThreadUseCase;
