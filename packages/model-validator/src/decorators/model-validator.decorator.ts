function ModelValidator(title: string) {
  return function (constructor: Function) {
    const properties: any = {};
    const required: string[] = [];

    for (const key of Object.keys(constructor.prototype)) {
      if (key === "constructor" || key === "defaults") continue;
      const property = constructor.prototype[key];

      if (property.required) {
        required.push(key);
      }

      if (property.type) {
        properties[key] = { type: property.type };

        if (property.enum) {
          properties[key].enum = property.enum;
        }
      }

      if (properties[key].type === "object" && property.schema) {
        properties[key].properties = property.schema.properties;
        properties[key].required = property.schema.required;
      }
    }

    const schema = {
      $schema: "http://json-schema.org/draft-04/schema#",
      title,
      type: "object",
      properties,
      required,
    };

    const baseSchema = Reflect.get(constructor, "schema");
    if (baseSchema) {
      schema.properties = { ...baseSchema.properties, ...schema.properties };
      schema.required = [...baseSchema.required, ...schema.required];
    }

    Reflect.set(constructor, "defaults", constructor.prototype.defaults || {});
    Reflect.set(constructor, "schema", schema);

    const restApi = Reflect.get(globalThis, "api");
    const app = Reflect.get(globalThis, "app");
  };
}

export default ModelValidator;
