function IsNumber() {
  return function (target: any, key: string) {
    if (!target) return;
    if (!target[key]) target[key] = {};
    target[key].type = "number";
  };
}

export default IsNumber;
