const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AddedReply = require('../../Domains/replies/entities/AddedReply');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(newReply) {
    const { thread, comment, content, owner } = newReply;
    const id = `reply-${this._idGenerator()}`;
    const createdAt = new Date().toISOString();
    const updateAt = createdAt;

    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5 ,$6, $7) RETURNING id, content, owner',
      values: [id, thread, comment, content, owner, createdAt, updateAt],
    };

    const result = await this._pool.query(query);

    return new AddedReply(result.rows[0]);
  }

  async checkAvailabilityReply(reply) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [reply],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new NotFoundError('balasan tidak ditemukan di database');
    }
  }

  async verifyReplyOwner(reply, owner) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1 AND owner = $2',
      values: [reply, owner],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new AuthorizationError('anda tidak bisa menghapus balasan orang lain.');
    }
  }

  async deleteReply(reply) {
    const deletedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE replies SET deleted_at = $2 WHERE id = $1',
      values: [reply, deletedAt],
    };

    await this._pool.query(query);
  }

  async getRepliesThread(thread) {
    const query = {
      text: `SELECT replies.id, replies.comment, users.username, replies.created_at AS date, replies.content, replies.deleted_at FROM replies 
      LEFT JOIN comments ON comments.id = replies.comment 
      LEFT JOIN users ON users.id = replies.owner 
      WHERE replies.thread = $1 
      ORDER BY replies.created_at 
      ASC`,
      values: [thread],
    };

    const { rows } = await this._pool.query(query);
    return rows;
  }
}

module.exports = ReplyRepositoryPostgres;
