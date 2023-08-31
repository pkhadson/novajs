export function Email() {
  return function (target: any, methodName: string, paramIndex: number) {
    Reflect.set(
      target,
      `param_${methodName}_${paramIndex}`,
      `$context.authorizer.claims.email`
    );
    return;
  };
}
