export class LogoutUseCases {
  constructor() {}

  async execute(): Promise<void> {
    // Logout is purely a transport concern (clearing cookies/tokens).
    // The use case exists as a placeholder for any domain-level
    // logout logic (e.g., invalidating refresh tokens in DB).
  }
}
