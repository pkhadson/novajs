import { AuthProvider } from "../auth-provider.class";

const storage = new Map<string, AuthProvider>();

export class AuthStorage {
  static get(name?: string | AuthProvider): AuthProvider {
    if (name instanceof AuthProvider) return name;

    const storageSize = storage.size;
    if (!name && storageSize > 1)
      throw new Error("Multiple auth providers found, please specify name");
    if (storageSize === 0) throw new Error("No auth providers found");
    if (!name) return storage.values().next().value;

    const provider = storage.get(name);

    if (!provider) throw new Error(`Auth provider ${name} not found`);

    return provider;
  }

  static set(provider: AuthProvider) {
    storage.set(provider.name, provider);
  }
}
