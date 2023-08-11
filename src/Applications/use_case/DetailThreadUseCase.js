const DetailThread = require('../../Domains/threads/entities/DetailThread');
const DetailComment = require('../../Domains/comments/entities/DetailComment');
// const DetailReply = require('../../Domains/replies/entities/DetailReply');

class DetailThreadUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    // this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    const { thread } = new DetailThread(useCasePayload);
    await this._threadRepository.checkAvailabilityThread(thread);
    const getDetailThread = await this._threadRepository.getDetailThread(thread);
    const getCommentsThread = await this._commentRepository.getCommentsThread(thread);
    // const getRepliesComment = await this._replyRepository.getRepliesComment(thread);

    getDetailThread.comments = new DetailComment({ comments: getCommentsThread }).comments;
    // getDetailThread.replies = new DetailReply({ replies: getRepliesComment }).replies;
    return {
      thread: getDetailThread,
    };
  }
}

module.exports = DetailThreadUseCase;
