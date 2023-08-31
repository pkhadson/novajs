import { IAuth } from "./interfaces/use-auth.interface";

export const useAuth = (opts: IAuth) => {
  return () => {
    for (let i = 0; i < opts.authorizers.length; i++) {
      const authorizer = opts.authorizers[i];
      authorizer();
    }
  };
};
