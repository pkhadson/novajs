function Param(name?: string) {
  return function (target: any, methodName: string, paramIndex: number) {
    if (name) {
      Reflect.set(
        target,
        `param_${methodName}_${paramIndex}`,
        `$input.params('${name}')`
      );
      return;
    }

    const proxy = new Proxy(
      {},
      {
        get(target, key) {
          return `$input.params('${key.toString()}')`;
        },
      }
    );

    Reflect.set(target, `param_${methodName}_${paramIndex}`, proxy);
  };
}
export default Param;
