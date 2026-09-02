import AddThreadUseCase from '../../../../Applications/use_case/AddThreadUseCase.js';
import GetThreadsUseCase from '../../../../Applications/use_case/GetThreadsUseCase.js';
import GetThreadDetailUseCase from '../../../../Applications/use_case/GetThreadDetailUseCase.js';

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getThreadsHandler = this.getThreadsHandler.bind(this);
    this.getThreadDetailHandler = this.getThreadDetailHandler.bind(this);
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

  async getThreadsHandler(req, res, next) {
    try {
      const getThreadsUseCase = this._container.getInstance(
        GetThreadsUseCase.name,
      );

      const threads = await getThreadsUseCase.execute();

      res.status(200).json({
        status: 'success',
        data: {
          threads,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getThreadDetailHandler(req, res, next) {
    try {
      const getThreadDetailUseCase = this._container.getInstance(
        GetThreadDetailUseCase.name,
      );

      const thread = await getThreadDetailUseCase.execute(req.params.threadId);

      res.status(200).json({
        status: 'success',
        data: {
          thread,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default ThreadsHandler;
