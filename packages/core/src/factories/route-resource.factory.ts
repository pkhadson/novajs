import { Resource } from "aws-cdk-lib/aws-apigateway";
import { Routes } from "../interfaces/route.interface";

export const RouteResourceFactory = (resource: Resource, routes: Routes) => {
  const result: Record<string, Resource> = {};

  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];
    const parts = route.route.split("/").filter((a) => a != "");

    let currentResource: Resource = resource;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (currentResource.getResource(part)) currentResource.getResource(part);
      else currentResource = currentResource.addResource(part);
    }
  }

  return result;
};
