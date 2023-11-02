
export class UserJoinedBefore extends Error {
    constructor(message: any) {
      super(message);
      this.name = 'UserJoinedBefore';
    }
  }
  
  export class ParticipantEnough extends Error {
    constructor(message: string) {
      super(message);
      this.name = "ParticipantEnough";
      Object.setPrototypeOf(this, ParticipantEnough.prototype);
    }
  }
  export class UserOrActivityNotFound extends Error {
    constructor(message: string) {
      super(message);
      this.name = "UserOrActivityNotFound";
      Object.setPrototypeOf(this, UserOrActivityNotFound.prototype);
    }
  }
  