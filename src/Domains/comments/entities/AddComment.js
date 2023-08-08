class AddComment {
  constructor(payload) {
    this._verifyPayload(payload);
    const { owner, thread, content } = payload;
    this.owner = owner;
    this.thread = thread;
    this.content = content;
  }

  _verifyPayload({ owner, thread, content }) {
    if (!owner || !thread || !content) {
      throw new Error('ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof owner !== 'string' || typeof thread !== 'string' || typeof content !== 'string') {
      throw new Error('ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = AddComment;
