const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

describe('CommentRepositoryPostgres', () => {
  it('should be instance of ThreadRepository domain', () => {
    const commentRepositoryPostgres = new CommentRepositoryPostgres({}, {});

    expect(commentRepositoryPostgres).toBeInstanceOf(CommentRepositoryPostgres);
  });

  describe('behavior test', () => {
    afterEach(async () => {
      await UsersTableTestHelper.cleanTable();
      await ThreadsTableTestHelper.cleanTable();
      await CommentsTableTestHelper.cleanTable();
    });

    afterAll(async () => {
      await pool.end();
    });

    describe('addComment function', () => {
      it('should persist new comment and return added comment correctly', async () => {
        await UsersTableTestHelper.addUser({
          id: 'user-123',
          username: 'dicoding',
        });

        await ThreadsTableTestHelper.addThread({
          id: 'thread-123',
          body: 'sebuah body thread',
          owner: 'user-123',
        });

        const newComment = new AddComment({
          content: 'sebuah komentar',
          thread: 'thread-123',
          owner: 'user-123',
        });

        const fakeIdGenerator = () => '123';
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

        const addedComment = await commentRepositoryPostgres.addComment(newComment);
        expect(addedComment).toStrictEqual(new AddedComment({
          id: 'comment-123',
          content: 'sebuah komentar',
          owner: 'user-123',
        }));

        const comment = await CommentsTableTestHelper.findCommentsById('comment-123');
        expect(comment).toHaveLength(1);
      });
    });

    describe('checkAvailabilityComment function', () => {
      it('should throw NotFoundError if comment not available', async () => {
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
        const comment = 'xxx';

        await expect(commentRepositoryPostgres.checkAvailabilityComment(comment))
          .rejects.toThrow(NotFoundError);
      });

      it('should not throw NotFoundError if comment available', async () => {
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
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
          content: 'sebuah komentar',
          thread: 'thread-123',
          owner: 'user-123',
        });

        await expect(commentRepositoryPostgres.checkAvailabilityComment('comment-123')).resolves.not.toThrow(NotFoundError);
      });
    });

    describe('verifyCommentOwner function', () => {
      it('should throw AuthorizationError if comment not belong to owner', async () => {
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
        await UsersTableTestHelper.addUser({
          id: 'user-123',
          username: 'dicoding',
        });

        await UsersTableTestHelper.addUser({
          id: 'user-456',
          username: 'dicoding_456',
        });

        await ThreadsTableTestHelper.addThread({
          id: 'thread-123',
          body: 'sebuah body thread',
          owner: 'user-123',
        });

        await CommentsTableTestHelper.addComment({
          id: 'comment-123',
          content: 'sebuah komentar',
          thread: 'thread-123',
          owner: 'user-123',
        });
        const owner = 'user-456';

        await expect(commentRepositoryPostgres.verifyCommentOwner('comment-123', owner))
          .rejects.toThrow(AuthorizationError);
      });

      it('should not throw AuthorizationError if comment is belongs to owner', async () => {
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
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
          content: 'sebuah komentar',
          thread: 'thread-123',
          owner: 'user-123',
        });

        await expect(commentRepositoryPostgres.verifyCommentOwner('comment-123', 'user-123')).resolves.not.toThrow(AuthorizationError);
      });
    });

    describe('deleteComment', () => {
      it('should delete comment from database', async () => {
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
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
          content: 'sebuah komentar',
          thread: 'thread-123',
          owner: 'user-123',
        });

        await commentRepositoryPostgres.deleteComment('comment-123');

        const comment = await CommentsTableTestHelper.checkdeletedAtCommentsById('comment-123');
        const isoDateRegex = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)$/;

        expect(typeof comment).toEqual('string');
        expect(isoDateRegex.test(comment)).toBeTruthy();
      });
    });

    describe('getCommentsThread', () => {
      it('should get comments of thread', async () => {
        const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
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

        await UsersTableTestHelper.addUser(userPayload);
        await ThreadsTableTestHelper.addThread(threadPayload);
        await CommentsTableTestHelper.addComment(commentPayload);

        const comments = await commentRepositoryPostgres.getCommentsThread(threadPayload.id);

        expect(Array.isArray(comments)).toBe(true);
        expect(comments[0].id).toEqual(commentPayload.id);
        expect(comments[0].thread).toEqual(threadPayload.id);
        expect(comments[0].username).toEqual(userPayload.username);
        expect(comments[0].content).toEqual('sebuah komentar');
        expect(comments[0].deleted_at).toBeDefined();
        expect(comments[0].date).toBeDefined();
      });
    });
  });
});
