export class AccountNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AccountNotFoundError";
    Object.setPrototypeOf(this, AccountNotFoundError.prototype);
  }
}

export class WrongPasswordError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WrongPasswordError";
    Object.setPrototypeOf(this, WrongPasswordError.prototype);
  }
}

export class UsernameExistError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UsernameExistError";
    Object.setPrototypeOf(this, UsernameExistError.prototype);
  }
}

export class PasswordFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PasswordFormatError";
    Object.setPrototypeOf(this, PasswordFormatError.prototype);
  }
}

export class EmailFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmailFormatError";
    Object.setPrototypeOf(this, EmailFormatError.prototype);
  }
}

export class OrgActiveBefore extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrgActiveBefore";
    Object.setPrototypeOf(this, OrgActiveBefore.prototype);
  }
}

export class AccountTypeNotOrg extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AccountTypeNotOrg";
    Object.setPrototypeOf(this, AccountTypeNotOrg.prototype);
  }
}

export class AccountTypeNotAdmin extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AccountTypeNotAdmin";
    Object.setPrototypeOf(this, AccountTypeNotAdmin.prototype);
  }
}