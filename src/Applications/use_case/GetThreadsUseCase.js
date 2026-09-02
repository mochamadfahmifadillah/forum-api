class GetThreadsUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute() {
    return this._threadRepository.getThreads();
  }
}

export default GetThreadsUseCase;
