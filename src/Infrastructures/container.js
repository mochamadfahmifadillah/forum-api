import { createContainer } from "instances-container";

// External agency

import { nanoid } from "nanoid";

import bcrypt from "bcrypt";

import jwt from "jsonwebtoken";

import pool from "./database/postgres/pool.js";

// ============================================================

// SERVICES / REPOSITORIES

// ============================================================

// User

import UserRepository from "../Domains/users/UserRepository.js";

import UserRepositoryPostgres from "./repository/UserRepositoryPostgres.js";

// Authentication

import AuthenticationRepository from "../Domains/authentications/AuthenticationRepository.js";

import AuthenticationRepositoryPostgres from "./repository/AuthenticationRepositoryPostgres.js";

// Security

import PasswordHash from "../Applications/security/PasswordHash.js";

import BcryptPasswordHash from "./security/BcryptPasswordHash.js";

import AuthenticationTokenManager from "../Applications/security/AuthenticationTokenManager.js";

import JwtTokenManager from "./security/JwtTokenManager.js";

// Thread

import ThreadRepository from "../Domains/threads/ThreadRepository.js";

import ThreadRepositoryPostgres from "./repository/ThreadRepositoryPostgres.js";

// Comment

import CommentRepository from "../Domains/comments/CommentRepository.js";

import CommentRepositoryPostgres from "./repository/CommentRepositoryPostgres.js";

// Comment Like

import CommentLikeRepository from "../Domains/comments/CommentLikeRepository.js";

import CommentLikeRepositoryPostgres from "./repository/CommentLikeRepositoryPostgres.js";

// Reply

import ReplyRepository from "../Domains/comments/ReplyRepository.js";

import ReplyRepositoryPostgres from "./repository/ReplyRepositoryPostgres.js";

// ============================================================

// USE CASES

// ============================================================

// User

import AddUserUseCase from "../Applications/use_case/AddUserUseCase.js";

// Authentication

import LoginUserUseCase from "../Applications/use_case/LoginUserUseCase.js";

import LogoutUserUseCase from "../Applications/use_case/LogoutUserUseCase.js";

import RefreshAuthenticationUseCase from "../Applications/use_case/RefreshAuthenticationUseCase.js";

// Thread

import AddThreadUseCase from "../Applications/use_case/AddThreadUseCase.js";

import GetThreadsUseCase from "../Applications/use_case/GetThreadsUseCase.js";

import GetThreadDetailUseCase from "../Applications/use_case/GetThreadDetailUseCase.js";

// Comment

import AddCommentUseCase from "../Applications/use_case/AddCommentUseCase.js";

import DeleteCommentUseCase from "../Applications/use_case/DeleteCommentUseCase.js";

// Comment Like

import ToggleCommentLikeUseCase from "../Applications/use_case/ToggleCommentLikeUseCase.js";

// Reply

import AddReplyUseCase from "../Applications/use_case/AddReplyUseCase.js";

import DeleteReplyUseCase from "../Applications/use_case/DeleteReplyUseCase.js";

// ============================================================

// CREATE CONTAINER

// ============================================================

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

  // ----------------------------------------------------------
  // Comment Repository
  // ----------------------------------------------------------

  {
    key: CommentRepository.name,
    Class: CommentRepositoryPostgres,
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
  // Comment Like Repository
  // ----------------------------------------------------------

  {
    key: CommentLikeRepository.name,
    Class: CommentLikeRepositoryPostgres,
    parameter: {
      dependencies: [
        {
          concrete: pool,
        },
      ],
    },
  },

  // ----------------------------------------------------------
  // Reply Repository
  // ----------------------------------------------------------

  {
    key: ReplyRepository.name,
    Class: ReplyRepositoryPostgres,
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
      injectType: "destructuring",
      dependencies: [
        {
          name: "userRepository",
          internal: UserRepository.name,
        },
        {
          name: "passwordHash",
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
      injectType: "destructuring",
      dependencies: [
        {
          name: "userRepository",
          internal: UserRepository.name,
        },
        {
          name: "authenticationRepository",
          internal: AuthenticationRepository.name,
        },
        {
          name: "authenticationTokenManager",
          internal: AuthenticationTokenManager.name,
        },
        {
          name: "passwordHash",
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
      injectType: "destructuring",
      dependencies: [
        {
          name: "authenticationRepository",
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
      injectType: "destructuring",
      dependencies: [
        {
          name: "authenticationRepository",
          internal: AuthenticationRepository.name,
        },
        {
          name: "authenticationTokenManager",
          internal: AuthenticationTokenManager.name,
        },
      ],
    },
  },

  // ==========================================================
  // THREAD USE CASES
  // ==========================================================

  // ----------------------------------------------------------
  // Add Thread
  // ----------------------------------------------------------

  {
    key: AddThreadUseCase.name,
    Class: AddThreadUseCase,
    parameter: {
      injectType: "destructuring",
      dependencies: [
        {
          name: "threadRepository",
          internal: ThreadRepository.name,
        },
      ],
    },
  },

  // ----------------------------------------------------------
  // Get Threads
  // ----------------------------------------------------------

  {
    key: GetThreadsUseCase.name,
    Class: GetThreadsUseCase,
    parameter: {
      injectType: "destructuring",
      dependencies: [
        {
          name: "threadRepository",
          internal: ThreadRepository.name,
        },
      ],
    },
  },

  // ----------------------------------------------------------
  // Get Thread Detail
  // ----------------------------------------------------------

  {
    key: GetThreadDetailUseCase.name,
    Class: GetThreadDetailUseCase,
    parameter: {
      injectType: "destructuring",
      dependencies: [
        {
          name: "threadRepository",
          internal: ThreadRepository.name,
        },
        {
          name: "commentRepository",
          internal: CommentRepository.name,
        },
        {
          name: "replyRepository",
          internal: ReplyRepository.name,
        },
        {
          name: "commentLikeRepository",
          internal: CommentLikeRepository.name,
        },
      ],
    },
  },

  // ==========================================================
  // COMMENT USE CASES
  // ==========================================================

  // ----------------------------------------------------------
  // Add Comment
  // ----------------------------------------------------------

  {
    key: AddCommentUseCase.name,
    Class: AddCommentUseCase,
    parameter: {
      injectType: "destructuring",
      dependencies: [
        {
          name: "commentRepository",
          internal: CommentRepository.name,
        },
        {
          name: "threadRepository",
          internal: ThreadRepository.name,
        },
      ],
    },
  },

  // ----------------------------------------------------------
  // Delete Comment
  // ----------------------------------------------------------

  {
    key: DeleteCommentUseCase.name,
    Class: DeleteCommentUseCase,
    parameter: {
      injectType: "destructuring",
      dependencies: [
        {
          name: "commentRepository",
          internal: CommentRepository.name,
        },
      ],
    },
  },

  // ==========================================================
  // COMMENT LIKE USE CASES
  // ==========================================================

  // ----------------------------------------------------------
  // Toggle Comment Like
  // ----------------------------------------------------------

  {
    key: ToggleCommentLikeUseCase.name,
    Class: ToggleCommentLikeUseCase,
    parameter: {
      injectType: "destructuring",
      dependencies: [
        {
          name: "commentLikeRepository",
          internal: CommentLikeRepository.name,
        },
        {
          name: "commentRepository",
          internal: CommentRepository.name,
        },
        {
          name: "threadRepository",
          internal: ThreadRepository.name,
        },
      ],
    },
  },

  // ==========================================================
  // REPLY USE CASES
  // ==========================================================

  // ----------------------------------------------------------
  // Add Reply
  // ----------------------------------------------------------

  {
    key: AddReplyUseCase.name,
    Class: AddReplyUseCase,
    parameter: {
      injectType: "destructuring",
      dependencies: [
        {
          name: "replyRepository",
          internal: ReplyRepository.name,
        },
        {
          name: "commentRepository",
          internal: CommentRepository.name,
        },
        {
          name: "threadRepository",
          internal: ThreadRepository.name,
        },
      ],
    },
  },

  // ----------------------------------------------------------
  // Delete Reply
  // ----------------------------------------------------------

  {
    key: DeleteReplyUseCase.name,
    Class: DeleteReplyUseCase,
    parameter: {
      injectType: "destructuring",
      dependencies: [
        {
          name: "replyRepository",
          internal: ReplyRepository.name,
        },
      ],
    },
  },
]);

export default container;
