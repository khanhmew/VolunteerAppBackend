export class PostMustCreateByOrg extends Error {
    constructor(message: string) {
      super(message);
      this.name = "PostMustCreateByOrg";
      Object.setPrototypeOf(this, PostMustCreateByOrg.prototype);
    }
}

export class ExpirationDateMustGreaterCurrentDate extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExpirationDateMustGreaterCurrentDate";
    Object.setPrototypeOf(this, ExpirationDateMustGreaterCurrentDate.prototype);
  }
}

export class DateFormat extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DateFormat";
    Object.setPrototypeOf(this, DateFormat.prototype);
  }
}

export class ParticipantsMustGreaterThan0 extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ParticipantsMustGreaterThan0";
    Object.setPrototypeOf(this, ParticipantsMustGreaterThan0.prototype);
  }
}

export class OrgNotActive extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrgNotActive";
    Object.setPrototypeOf(this, OrgNotActive.prototype);
  }
}

