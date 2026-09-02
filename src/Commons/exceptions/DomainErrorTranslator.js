import InvariantError from "./InvariantError.js";
import NotFoundError from "./NotFoundError.js";
import AuthorizationError from "./AuthorizationError.js";

const DomainErrorTranslator = {
  translate(error) {
    return DomainErrorTranslator._directories[error.message] || error;
  },
};

DomainErrorTranslator._directories = {
  // ============================================================
  // USER
  // ============================================================

  "REGISTER_USER.NOT_CONTAIN_NEEDED_PROPERTY": new InvariantError(
    "tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada",
  ),

  "REGISTER_USER.NOT_MEET_DATA_TYPE_SPECIFICATION": new InvariantError(
    "tidak dapat membuat user baru karena tipe data tidak sesuai",
  ),

  "REGISTER_USER.USERNAME_LIMIT_CHAR": new InvariantError(
    "tidak dapat membuat user baru karena karakter username melebihi batas limit",
  ),

  "REGISTER_USER.USERNAME_CONTAIN_RESTRICTED_CHARACTER": new InvariantError(
    "tidak dapat membuat user baru karena username mengandung karakter terlarang",
  ),

  // ============================================================
  // LOGIN
  // ============================================================

  "USER_LOGIN.NOT_CONTAIN_NEEDED_PROPERTY": new InvariantError(
    "harus mengirimkan username dan password",
  ),

  "USER_LOGIN.NOT_MEET_DATA_TYPE_SPECIFICATION": new InvariantError(
    "username dan password harus string",
  ),

  // ============================================================
  // AUTHENTICATION
  // ============================================================

  "REFRESH_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN":
    new InvariantError("harus mengirimkan token refresh"),

  "REFRESH_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION":
    new InvariantError("refresh token harus string"),

  "DELETE_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN":
    new InvariantError("harus mengirimkan token refresh"),

  "DELETE_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION":
    new InvariantError("refresh token harus string"),

  // ============================================================
  // THREAD
  // ============================================================

  "THREAD.NOT_CONTAIN_NEEDED_PROPERTY": new InvariantError(
    "tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada",
  ),

  "THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION": new InvariantError(
    "tidak dapat membuat thread baru karena tipe data tidak sesuai",
  ),

  "THREAD.NOT_FOUND": new NotFoundError("thread tidak ditemukan"),

  // ============================================================
  // COMMENT
  // ============================================================

  "COMMENT.NOT_CONTAIN_NEEDED_PROPERTY": new InvariantError(
    "tidak dapat membuat komentar baru karena properti yang dibutuhkan tidak ada",
  ),

  "COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION": new InvariantError(
    "tidak dapat membuat komentar baru karena tipe data tidak sesuai",
  ),

  "COMMENT.NOT_FOUND": new NotFoundError("komentar tidak ditemukan"),

  "COMMENT.NOT_AUTHORIZED": new AuthorizationError(
    "anda tidak berhak menghapus komentar ini",
  ),

  // ============================================================
  // REPLY
  // ============================================================

  "REPLY.NOT_CONTAIN_NEEDED_PROPERTY": new InvariantError(
    "tidak dapat membuat balasan baru karena properti yang dibutuhkan tidak ada",
  ),

  "REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION": new InvariantError(
    "tidak dapat membuat balasan baru karena tipe data tidak sesuai",
  ),

  "REPLY.NOT_FOUND": new NotFoundError("balasan tidak ditemukan"),

  "REPLY.NOT_AUTHORIZED": new AuthorizationError(
    "anda tidak berhak menghapus balasan ini",
  ),
};

export default DomainErrorTranslator;
