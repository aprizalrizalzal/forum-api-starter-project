const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AddedComment = require('../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../Domains/comments/CommentRepository');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(newComment) {
    const { content, thread, owner } = newComment;
    const id = `comment-${this._idGenerator()}`;
    const createdAt = new Date().toISOString();
    const updateAt = createdAt;

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5 ,$6) RETURNING id, content, owner',
      values: [id, thread, content, owner, createdAt, updateAt],
    };

    const result = await this._pool.query(query);

    return new AddedComment(result.rows[0]);
  }

  async checkAvailabilityComment(comment) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [comment],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new NotFoundError('komentar tidak ditemukan di database');
    }
  }

  async verifyCommentOwner(comment, owner) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1 AND owner = $2',
      values: [comment, owner],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new AuthorizationError('anda tidak bisa menghapus komentar orang lain.');
    }
  }

  async deleteComment(comment) {
    const deletedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE comments SET deleted_at = $2 WHERE id = $1',
      values: [comment, deletedAt],
    };

    await this._pool.query(query);
  }

  async getCommentsThread(thread) {
    const query = {
      text: `SELECT comments.id, comments.thread, users.username, comments.created_at AS date, comments.content, comments.deleted_at FROM comments 
      LEFT JOIN threads ON threads.id = comments.thread 
      LEFT JOIN users ON users.id = comments.owner
      WHERE comments.thread = $1 
      ORDER BY comments.created_at 
      ASC`,
      values: [thread],
    };

    const { rows } = await this._pool.query(query);
    return rows;
  }
}

module.exports = CommentRepositoryPostgres;
