import { IGenericSchema } from "../interfaces/validator-schema.interface";

function UseModel(type: Function) {
  const schema: IGenericSchema = Reflect.get(type, "schema");

  let result: Record<string, string> = {};

  const keys = Object.keys(schema.properties);

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const property = schema.properties[key];
    const isRequired = schema.required?.includes(key);
    const hasDefaultValue = Reflect.get(type, "defaults")?.[key];
    const field = `$input.json('$.${key}')`;

    let part = `#UNCOMMA`;
    if (isRequired) part += field;
    else {
      part += `#if($input.path('$.${key}').isEmpty()=='') `;
      part += `${field} `;
      if (hasDefaultValue) part += `#else ${hasDefaultValue} `;
      part += `#end`;
    }

    // if (property.type === "string") {
    //   if (isRequired) result[key] = `$input.path('!$.${key}')`;
    //   // else result[key] = `!$input.path('!$.${key}')`;
    // }
    // else if (property.type === "number") {
    //   result[key] = `#INT!$input.path('!$.${key}')`;
    // } else if (property.type === "boolean") {
    //   result[key] = `#BOOL!$input.path('!$.${key}')`;
    // }

    result[key] = part;
  }

  // name: "!$input.path('!$.name')",
  // age: "#INT!$input.path('!$.age')",

  return function (target: any, methodName: string, paramIndex: number) {
    Reflect.set(target, `param_${methodName}_${paramIndex}`, result);
    Reflect.set(target, `schema_${methodName}`, schema);
  };
}

export default UseModel;
