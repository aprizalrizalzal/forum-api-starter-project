const DetailThread = require('../../Domains/threads/entities/DetailThread');
const DetailComment = require('../../Domains/comments/entities/DetailComment');

class DetailThreadUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const { thread } = new DetailThread(useCasePayload);
    await this._threadRepository.checkAvailabilityThread(thread);
    const getDetailThread = await this._threadRepository.getDetailThread(thread);
    const getCommentsThread = await this._commentRepository.getCommentsThread(thread);
    getDetailThread.comments = new DetailComment({ comments: getCommentsThread }).comments;
    return {
      thread: getDetailThread,
    };
  }
}

module.exports = DetailThreadUseCase;
