function DefaultValue(value: string | boolean | number) {
  return function (target: any, key: string) {
    if (!target) return;
    if (!target.defaults) target.defaults = {};

    target.defaults[key] = value;
  };
}

export default DefaultValue;
