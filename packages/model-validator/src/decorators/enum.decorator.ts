type TVal = string | number;

function IsEnum(values: TVal[]) {
  return function (target: any, key: string) {
    if (!target) return;
    if (!target[key]) target[key] = {};
    target[key].enum = values;
  };
}

export default IsEnum;
