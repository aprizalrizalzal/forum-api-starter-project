const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');

describe('ReplyRepositoryPostgres', () => {
  it('should be instance of ThreadRepository domain', () => {
    const replyRepositoryPostgres = new ReplyRepositoryPostgres({}, {});

    expect(replyRepositoryPostgres).toBeInstanceOf(ReplyRepositoryPostgres);
  });

  describe('behavior test', () => {
    afterEach(async () => {
      await UsersTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
      await CommentsTableTestHelper.cleanTable();
      await RepliesTableTestHelper.cleanTable();
    });

    afterAll(async () => {
      await pool.end();
    });

    describe('addReply function', () => {
      it('should persist new reply and return added reply correctly', async () => {
        await UsersTableTestHelper.addUser({
          id: 'user-123',
          username: 'dicoding',
        });

        await ThreadsTableTestHelper.addThread({
          id: 'thread-123',
          body: 'sebuah body thread',
          owner: 'user-123',
        });

        await CommentsTableTestHelper.addComment({
          id: 'comment-123',
          thread: 'thread-123',
          content: 'sebuah komentar',
          owner: 'user-123',
        });

        const newReply = new AddReply({
          thread: 'thread-123',
          comment: 'comment-123',
          content: 'sebuah balasan',
          owner: 'user-123',
        });

        const fakeIdGenerator = () => '123';
        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

        const addedReply = await replyRepositoryPostgres.addReply(newReply);
        expect(addedReply).toStrictEqual(new AddedReply({
          id: 'reply-123',
          content: 'sebuah balasan',
          owner: 'user-123',
        }));

        const reply = await RepliesTableTestHelper.findRepliesById('reply-123');
        expect(reply).toHaveLength(1);
      });
    });

    describe('checkAvailabilityReply function', () => {
      it('should throw NotFoundError if reply not available', async () => {
        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
        const reply = 'xxx';

        await expect(replyRepositoryPostgres.checkAvailabilityReply(reply))
          .rejects.toThrow(NotFoundError);
      });

      it('should not throw NotFoundError if reply available', async () => {
        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
        await UsersTableTestHelper.addUser({
          id: 'user-123',
          username: 'dicding',
        });

        await ThreadsTableTestHelper.addThread({
          id: 'thread-123',
          body: 'sebuah body thread',
          owner: 'user-123',
        });

        await CommentsTableTestHelper.addComment({
          id: 'comment-123',
          thread: 'thread-123',
          content: 'sebuah komentar',
          owner: 'user-123',
        });

        await RepliesTableTestHelper.addReply({
          id: 'reply-123',
          thread: 'thread-123',
          comment: 'comment-123',
          content: 'sebuah balasan',
          owner: 'user-123',
        });

        await expect(replyRepositoryPostgres.checkAvailabilityReply('reply-123')).resolves.not.toThrow(NotFoundError);
      });
    });

    describe('verifyReplyOwner function', () => {
      it('should throw AuthorizationError if reply not belong to owner', async () => {
        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
        await UsersTableTestHelper.addUser({
          id: 'user-123',
          username: 'dicoding',
        });

        await UsersTableTestHelper.addUser({
          id: 'user-123456',
          username: 'dicoding_123456',
        });

        await ThreadsTableTestHelper.addThread({
          id: 'thread-123',
          body: 'sebuah body thread',
          owner: 'user-123',
        });

        await CommentsTableTestHelper.addComment({
          id: 'comment-123',
          thread: 'thread-123',
          content: 'sebuah komentar',
          owner: 'user-123',
        });

        await RepliesTableTestHelper.addReply({
          id: 'reply-123',
          thread: 'thread-123',
          comment: 'comment-123',
          content: 'sebuah balasan',
          owner: 'user-123',
        });
        const owner = 'user-123456';

        await expect(replyRepositoryPostgres.verifyReplyOwner('reply-123', owner))
          .rejects.toThrow(AuthorizationError);
      });

      it('should not throw AuthorizationError if reply is belongs to owner', async () => {
        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
        await UsersTableTestHelper.addUser({
          id: 'user-123',
          username: 'dicoding',
        });

        await ThreadsTableTestHelper.addThread({
          id: 'thread-123',
          body: 'sebuah body thread',
          owner: 'user-123',
        });

        await CommentsTableTestHelper.addComment({
          id: 'comment-123',
          thread: 'thread-123',
          content: 'sebuah komentar',
          owner: 'user-123',
        });

        await RepliesTableTestHelper.addReply({
          id: 'reply-123',
          thread: 'thread-123',
          comment: 'comment-123',
          content: 'sebuah balasan',
          owner: 'user-123',
        });

        await expect(replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-123')).resolves.not.toThrow(AuthorizationError);
      });
    });

    describe('deleteReply', () => {
      it('should delete reply from database', async () => {
        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
        await UsersTableTestHelper.addUser({
          id: 'user-123',
          username: 'dicoding123'
        });

        await ThreadsTableTestHelper.addThread({
          id: 'thread-123',
          body: 'sebuah body thread',
          owner: 'user-123'
        });

        await CommentsTableTestHelper.addComment({
          id: 'comment-123',
          thread: 'thread-123',
          content: 'sebuah komentar',
          owner: 'user-123',
        });

        await RepliesTableTestHelper.addReply({
          id: 'reply-123',
          thread: 'thread-123',
          comment: 'comment-123',
          content: 'sebuah balasan',
          owner: 'user-123',
        });

        await replyRepositoryPostgres.deleteReply('reply-123');

        const reply = await RepliesTableTestHelper.checkDeletedAtRepliesById('reply-123');
        const isoDateRegex = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)$/;

        expect(typeof reply).toEqual('string');
        expect(isoDateRegex.test(reply)).toBeTruthy();
      });
    });

    describe('getRepliesThread', () => {
      it('should get replies from threads based on comments', async () => {
        const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
        const userPayload = {
          id: 'user-123',
          username: 'dicoding'
        };

        const threadPayload = {
          id: 'thread-123',
          title: 'sebuah thread',
          body: 'sebuah body thread',
          owner: 'user-123',
        };

        const commentPayload = {
          id: 'comment-123',
          content: 'sebuah komentar',
          thread: threadPayload.id,
          owner: userPayload.id,
        };

        const replyPayload = {
          id: 'reply-123',
          thread: threadPayload.id,
          comment: commentPayload.id,
          content: 'sebuah balasan',
          owner: userPayload.id,
        };

        await UsersTableTestHelper.addUser(userPayload);
        await ThreadsTableTestHelper.addThread(threadPayload);
        await CommentsTableTestHelper.addComment(commentPayload);
        await RepliesTableTestHelper.addReply(replyPayload);

        const replies = await replyRepositoryPostgres.getRepliesThread(threadPayload.id);

        expect(Array.isArray(replies)).toBe(true);
        expect(replies[0].id).toEqual(replyPayload.id);
        expect(replies[0].comment).toEqual(commentPayload.id);
        expect(replies[0].username).toEqual(userPayload.username);
        expect(replies[0].content).toEqual('sebuah balasan');
        expect(replies[0].deleted_at).toBeDefined();
        expect(replies[0].date).toBeDefined();
      });
    });
  });
});
