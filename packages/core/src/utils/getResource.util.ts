import { Resource } from "aws-cdk-lib/aws-apigateway";

const getResource = (resource: Resource, route: string): Resource => {
  const parts = route.split("/").filter((a) => a != "");
  let currentResource: Resource = resource;
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;
    if (currentResource.getResource(part)) currentResource.getResource(part);
    else currentResource = currentResource.addResource(part);
  }

  return currentResource;
};

export default getResource;
