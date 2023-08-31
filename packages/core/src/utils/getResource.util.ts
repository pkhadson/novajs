import { Resource } from "aws-cdk-lib/aws-apigateway";

const getResource = (resource: Resource, route: string): Resource => {
  const parts = route.split("/").filter((a) => a != "");
  let currentResource: Resource = resource;
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;
    const existingResource = currentResource.getResource(part) as Resource;
    currentResource = existingResource || currentResource.addResource(part);
  }

  return currentResource;
};

export default getResource;
