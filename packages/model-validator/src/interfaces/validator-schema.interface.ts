export type ISchema<T> = {
  $schema: string;
  title: string;
  type: IEnumType;
  properties: { [K in keyof T]: PropertySchema<T[K]> };
  required: Array<keyof T>;
};

type IEnumType = "string" | "number" | "boolean" | "array" | "object";

type PropertySchema<T> = T extends string
  ? { type: "string" }
  : T extends number
  ? { type: "number" }
  : T extends boolean
  ? { type: "boolean" }
  : T extends Array<infer U>
  ? { type: "array"; items: PropertySchema<U> }
  : { type: "object"; properties: { [K in keyof T]: PropertySchema<T[K]> } };

type GenericPropertySchema = {
  type: IEnumType;
  items?: GenericPropertySchema;
  properties?: Record<string, GenericPropertySchema>;
};

export type IGenericSchema = {
  $schema: string;
  title: string;
  type: IEnumType;
  properties: Record<string, GenericPropertySchema>;
  required?: string[];
};
