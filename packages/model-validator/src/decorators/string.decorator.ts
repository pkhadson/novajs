function IsString() {
  return function (target: any, key: string) {
    if (!target) return;

    if (!target[key]) target[key] = {};
    target[key].type = "string";
  };
}

export default IsString;
