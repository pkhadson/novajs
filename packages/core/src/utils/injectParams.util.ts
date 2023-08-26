function injectParams(
  target: any,
  methodName: string,
  descriptor: PropertyDescriptor
) {
  const originalFunction = target[methodName];
  descriptor.value = function (...args: any[]) {
    args = new Array(originalFunction.length)
      .fill(0)
      .map(
        (value, i) => Reflect.get(target, `param_${methodName}_${i}`) || value
      );

    return originalFunction.apply(this, args);
  };
}

export default injectParams;
