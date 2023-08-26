function IsObject(fn: Function) {
  return function (target: any, key: string) {
    if (!target) return;

    if (!target[key]) target[key] = {};

    const schema = Reflect.get(fn, "schema");

    target[key].type = "object";
    target[key].schema = schema;
  };
}

export default IsObject;
