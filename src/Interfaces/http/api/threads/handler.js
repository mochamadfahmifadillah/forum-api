import AddThreadUseCase from '../../../../Applications/use_case/AddThreadUseCase.js';

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
  }

  async postThreadHandler(req, res, next) {
    try {
      const { id: owner } = req.auth.credentials;

      const addThreadUseCase = this._container.getInstance(
        AddThreadUseCase.name,
      );

      const addedThread = await addThreadUseCase.execute(owner, req.body);

      res.status(201).json({
        status: 'success',
        data: {
          addedThread: {
            id: addedThread.id,
            title: addedThread.title,
            owner: addedThread.owner,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default ThreadsHandler;
