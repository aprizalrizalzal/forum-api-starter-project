const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

describe('ThreadRepositoryPostgres', () => {
  it('should be instance of ThreadRepository domain', () => {
    const threadRepositoryPostgres = new ThreadRepositoryPostgres({}, {});

    expect(threadRepositoryPostgres).toBeInstanceOf(ThreadRepository);
  });

  describe('behavior test', () => {
    afterEach(async () => {
      await ThreadsTableTestHelper.cleanTable();
      await UsersTableTestHelper.cleanTable();
    });

    afterAll(async () => {
      await pool.end();
    });

    describe('addThread function', () => {
      it('should persist new thread and return added thread correctly', async () => {
        await UsersTableTestHelper.addUser({
          id: 'user-123',
          username: 'dicoding',
        });

        const newThread = new AddThread({
          title: 'sebuah thread',
          body: 'sebuah body thread',
          owner: 'user-123',
        });

        const fakeIdGenerator = () => '123';
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

        const addedThread = await threadRepositoryPostgres.addThread(newThread);
        expect(addedThread).toStrictEqual(new AddedThread({
          id: 'thread-123',
          title: 'sebuah thread',
          owner: 'user-123',
        }));

        const thread = await ThreadsTableTestHelper.findThreadsById('thread-123');
        expect(thread).toHaveLength(1);
      });
    });

    describe('checkAvailabilityThread function', () => {
      it('should throw NotFoundError if thread not available', async () => {
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

        const threadId = 'thread-456';

        await expect(threadRepositoryPostgres.checkAvailabilityThread(threadId))
          .rejects.toThrow(NotFoundError);
      });

      it('should not throw NotFoundError if thread available', async () => {
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

        await UsersTableTestHelper.addUser({
          id: 'user-123',
          username: 'dicoding',
        });
        await ThreadsTableTestHelper.addThread({
          id: 'thread-123',
          body: 'sebuah body thread',
          owner: 'user-123',
        });

        await expect(threadRepositoryPostgres.checkAvailabilityThread('thread-123'))
          .resolves.not.toThrow(NotFoundError);
      });
    });

    describe('getDetailThread function', () => {
      it('should get detail thread', async () => {
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

        const userPayload = {
          id: 'user-123',
          username: 'dicoding123',
        };

        await UsersTableTestHelper.addUser(userPayload);

        const threadPayload = {
          id: 'thread-123',
          title: 'sebuah thread',
          body: 'sebuah body thread',
          owner: 'user-123',
        };

        await ThreadsTableTestHelper.addThread(threadPayload);

        const detailThread = await threadRepositoryPostgres.getDetailThread(threadPayload.id);

        expect(detailThread.id).toEqual(threadPayload.id);
        expect(detailThread.title).toEqual(threadPayload.title);
        expect(detailThread.body).toEqual(threadPayload.body);
        expect(detailThread.username).toEqual(userPayload.username);
      });
    });
  });
});
