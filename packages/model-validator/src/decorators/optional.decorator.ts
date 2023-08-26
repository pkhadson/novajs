function IsOptional() {
  return function (target: any, key: string) {
    if (!target) return;
    if (!target[key]) target[key] = {};
    target[key].required = false;
  };
}

export default IsOptional;
