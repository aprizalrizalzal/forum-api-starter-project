/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
  async addComment({
    id = 'comment-123', content = 'sebuah comment', thread = 'thread-123', owner = 'user-123',
  }) {
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;
    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, thread, content, owner, createdAt, updatedAt],
    };

    await pool.query(query);
  },

  async findCommentsById(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async checkdeletedAtCommentsById(id) {
    const query = {
      text: 'SELECT deleted_at FROM comments WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    const deletedAt = result.rows[0].deleted_at;
    return deletedAt;
  },

  async deleteComment(id) {
    const deletedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE comments SET deleted_at = $2 WHERE id = $1',
      values: [id, deletedAt],
    };
    await pool.query(query);
  },

  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1=1');
  },
};

module.exports = CommentsTableTestHelper;
