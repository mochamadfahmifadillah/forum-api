import Thread from '../Thread.js';

describe('a Thread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      title: 'Sebuah thread',
      body: 'Sebuah body thread',
      date: new Date().toISOString(),
      owner: 'user-123',
    };

    // Action and Assert
    expect(() => new Thread(payload)).toThrowError(
      'THREAD.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      title: 'Sebuah thread',
      body: 'Sebuah body thread',
      date: new Date().toISOString(),
      owner: 'user-123',
    };

    // Action and Assert
    expect(() => new Thread(payload)).toThrowError(
      'THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create thread object correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'Sebuah thread',
      body: 'Sebuah body thread',
      date: new Date().toISOString(),
      owner: 'user-123',
    };

    // Action
    const thread = new Thread(payload);

    // Assert
    expect(thread.id).toEqual(payload.id);
    expect(thread.title).toEqual(payload.title);
    expect(thread.body).toEqual(payload.body);
    expect(thread.date).toEqual(payload.date);
    expect(thread.owner).toEqual(payload.owner);
  });
});
