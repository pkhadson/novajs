import injectParams from "../utils/injectParams.util";

const Generic = (method = "") =>
  function (route?: string) {
    return function (target: any, ctx: any, descriptor: PropertyDescriptor) {
      const routes = Reflect.get(target, "routes") || [];
      Reflect.set(target, "routes", [
        ...routes,
        { route: route || "", method, fn: ctx.name || ctx },
      ]);

      injectParams(target, ctx, descriptor);
    };
  };

export const Get = Generic("GET");
export const Post = Generic("POST");
export const Put = Generic("PUT");
export const Delete = Generic("DELETE");
export const Patch = Generic("PATCH");
export const Options = Generic("OPTIONS");

// export function Post(route?: string) {
//   return function (target: any, ctx: any, descriptor: PropertyDescriptor) {
//     const routes = Reflect.get(target, "routes") || [];
//     Reflect.set(target, "routes", [
//       ...routes,
//       {
//         route: route || "",
//         fn: ctx.name || ctx,
//       },
//     ]);

//     injectParams(target, ctx, descriptor);
//   };
// }
