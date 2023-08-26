function QueryString(name: string[]) {
  if (!name && !Array.isArray(name))
    throw new Error("QueryString decorator must have a name");
  return function (target: any, ctx: any, descriptor: PropertyDescriptor) {
    Reflect.set(target, `query_${ctx.name || ctx}`, name);
  };
}
export default QueryString;
