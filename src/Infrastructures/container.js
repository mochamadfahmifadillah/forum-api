import { createContainer } from 'instances-container';

// external agency
import { nanoid } from 'nanoid';
import bcrypt from 'bcrypt';
import pool from './database/postgres/pool.js';
import jwt from 'jsonwebtoken';

// service (repository, helper, manager, etc)
import UserRepository from '../Domains/users/UserRepository.js';
import PasswordHash from '../Applications/security/PasswordHash.js';
import UserRepositoryPostgres from './repository/UserRepositoryPostgres.js';
import BcryptPasswordHash from './security/BcryptPasswordHash.js';

import AuthenticationTokenManager from '../Applications/security/AuthenticationTokenManager.js';
import JwtTokenManager from './security/JwtTokenManager.js';

import AuthenticationRepository from '../Domains/authentications/AuthenticationRepository.js';
import AuthenticationRepositoryPostgres from './repository/AuthenticationRepositoryPostgres.js';

// Thread
import ThreadRepository from '../Domains/threads/ThreadRepository.js';
import ThreadRepositoryPostgres from './repository/ThreadRepositoryPostgres.js';

// use case
import AddUserUseCase from '../Applications/use_case/AddUserUseCase.js';
import LoginUserUseCase from '../Applications/use_case/LoginUserUseCase.js';
import LogoutUserUseCase from '../Applications/use_case/LogoutUserUseCase.js';
import RefreshAuthenticationUseCase from '../Applications/use_case/RefreshAuthenticationUseCase.js';

// Thread use case
import AddThreadUseCase from '../Applications/use_case/AddThreadUseCase.js';

// creating container
const container = createContainer();

// ============================================================
// REGISTERING SERVICES AND REPOSITORIES
// ============================================================

container.register([
  // ----------------------------------------------------------
  // User Repository
  // ----------------------------------------------------------
  {
    key: UserRepository.name,
    Class: UserRepositoryPostgres,
    parameter: {
      dependencies: [
        {
          concrete: pool,
        },
        {
          concrete: nanoid,
        },
      ],
    },
  },

  // ----------------------------------------------------------
  // Authentication Repository
  // ----------------------------------------------------------
  {
    key: AuthenticationRepository.name,
    Class: AuthenticationRepositoryPostgres,
    parameter: {
      dependencies: [
        {
          concrete: pool,
        },
      ],
    },
  },

  // ----------------------------------------------------------
  // Password Hash
  // ----------------------------------------------------------
  {
    key: PasswordHash.name,
    Class: BcryptPasswordHash,
    parameter: {
      dependencies: [
        {
          concrete: bcrypt,
        },
      ],
    },
  },

  // ----------------------------------------------------------
  // Authentication Token Manager
  // ----------------------------------------------------------
  {
    key: AuthenticationTokenManager.name,
    Class: JwtTokenManager,
    parameter: {
      dependencies: [
        {
          concrete: jwt,
        },
      ],
    },
  },

  // ----------------------------------------------------------
  // Thread Repository
  // ----------------------------------------------------------
  {
    key: ThreadRepository.name,
    Class: ThreadRepositoryPostgres,
    parameter: {
      dependencies: [
        {
          concrete: pool,
        },
        {
          concrete: nanoid,
        },
      ],
    },
  },
]);

// ============================================================
// REGISTERING USE CASES
// ============================================================

container.register([
  // ----------------------------------------------------------
  // Add User
  // ----------------------------------------------------------
  {
    key: AddUserUseCase.name,
    Class: AddUserUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        {
          name: 'userRepository',
          internal: UserRepository.name,
        },
        {
          name: 'passwordHash',
          internal: PasswordHash.name,
        },
      ],
    },
  },

  // ----------------------------------------------------------
  // Login User
  // ----------------------------------------------------------
  {
    key: LoginUserUseCase.name,
    Class: LoginUserUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        {
          name: 'userRepository',
          internal: UserRepository.name,
        },
        {
          name: 'authenticationRepository',
          internal: AuthenticationRepository.name,
        },
        {
          name: 'authenticationTokenManager',
          internal: AuthenticationTokenManager.name,
        },
        {
          name: 'passwordHash',
          internal: PasswordHash.name,
        },
      ],
    },
  },

  // ----------------------------------------------------------
  // Logout User
  // ----------------------------------------------------------
  {
    key: LogoutUserUseCase.name,
    Class: LogoutUserUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        {
          name: 'authenticationRepository',
          internal: AuthenticationRepository.name,
        },
      ],
    },
  },

  // ----------------------------------------------------------
  // Refresh Authentication
  // ----------------------------------------------------------
  {
    key: RefreshAuthenticationUseCase.name,
    Class: RefreshAuthenticationUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        {
          name: 'authenticationRepository',
          internal: AuthenticationRepository.name,
        },
        {
          name: 'authenticationTokenManager',
          internal: AuthenticationTokenManager.name,
        },
      ],
    },
  },

  // ----------------------------------------------------------
  // Add Thread
  // ----------------------------------------------------------
  {
    key: AddThreadUseCase.name,
    Class: AddThreadUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        {
          name: 'threadRepository',
          internal: ThreadRepository.name,
        },
      ],
    },
  },
]);

export default container;
