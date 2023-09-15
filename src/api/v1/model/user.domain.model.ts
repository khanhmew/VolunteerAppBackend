export class UserDomainModel {
  save = (data: any) => {
    return null;
  }

  formatUsername = (username: string) => {
    // Bussiness logic
    return `bussiness-rule-${username}`
  }
}