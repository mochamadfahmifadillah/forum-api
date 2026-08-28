class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(owner, useCasePayload) {
    return this._threadRepository.addThread(
      owner,
      useCasePayload,
    );
  }
}

export default AddThreadUseCase;
