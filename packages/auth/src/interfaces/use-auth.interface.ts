import { AuthProvider } from "../auth-provider.class";

export interface IAuth {
  authorizers: ((...a: any[]) => AuthProvider)[];
}
