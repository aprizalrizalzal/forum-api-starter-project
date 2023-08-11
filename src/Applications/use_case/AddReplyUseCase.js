const AddReply = require('../../Domains/replies/entities/AddReply');

class AddReplyUseCase {
  constructor({ replyRepository, commentRepository, threadRepository }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const { thread } = useCasePayload;
    await this._threadRepository.checkAvailabilityThread(thread);
    const { comment } = useCasePayload;
    await this._commentRepository.checkAvailabilityComment(comment);
    const newReply = new AddReply(useCasePayload);
    return this._replyRepository.addReply(newReply);
  }
}

module.exports = AddReplyUseCase;
