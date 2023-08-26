export * from "./decorators/queries.decorators";
import { IAtlasConfig } from "./interfaces/config.interface";

export const useAtlas = (config: IAtlasConfig) => {
  Reflect.set(globalThis, "ATLAS.CONFIG", config);
};
