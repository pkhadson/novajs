import Application from "../application.class";
import { IApplicationParams } from "../interfaces/application.interface";

Reflect.set(globalThis, "api", {});

export const NovaFactory = {
  create(params: IApplicationParams) {
    return new Application(params);
  },
};
