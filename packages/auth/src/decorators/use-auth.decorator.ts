import { AuthProvider } from "../auth-provider.class";
import { AuthStorage } from "../storages/auth.storage";

export const UseAuth = (authorizer?: string | AuthProvider) => {
  return (target: any, method: string | any) => {
    Reflect.set(
      target.constructor,
      `authorizer_fn_${method.name || method}`,
      () => {
        return AuthStorage.get(authorizer);
      }
    );
  };
};
