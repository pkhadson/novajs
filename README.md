<p  align="center">

<picture>

<source  media="(prefers-color-scheme: dark)"  srcset="https://pkhadson.s3.sa-east-1.amazonaws.com/nova-light.png">

<img  alt="NovaJS Logo"  src="https://pkhadson.s3.sa-east-1.amazonaws.com/nova-dark.png">

</picture>

</p>

<p  align="center">NovaJS is a new nodejs package for serverless API</p>

<p  align="center">

<img  src="https://img.shields.io/npm/v/@jsnova/core.svg"  alt="NPM Version"  />

<img  src="https://img.shields.io/npm/l/@jsnova/core.svg"  alt="Package License"  />

<img  src="https://img.shields.io/npm/dm/@jsnova/core.svg"  alt="NPM Downloads"  />

</p>

## Description

The `@jsnova/core` is a library aimed at facilitating the rapid development of Serverless APIs using AWS CDK with TypeScript. With this library, you can create advanced APIs and perform complex queries on databases without the need to run additional machines or lambda functions. All of this is made possible using just the AWS API Gateway and other functionalities provided by AWS.

## Packages

| Package name              | Description                                                                                                                | Docs                                                                                        |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `@jsnova/core`            | Simplify Serverless API development using AWS CDK, providing a comprehensive toolkit for streamlined implementation.       | [see docs](https://github.com/pkhadson/novajs/blob/main/packages/core/README.md)            |
| `@jsnova/model-validator` | Ensure data integrity with easy-to-use validation and mapping of API payload data for enhanced endpoint reliability.       | [see docs](https://github.com/pkhadson/novajs/blob/main/packages/model-validator/README.md) |
| `@jsnova/atlas`           | Seamless MongoDB Atlas integration through DataAPI, optimizing resource efficiency and reducing database operation costs.. | [see docs](https://github.com/pkhadson/novajs/blob/main/packages/atlas/README.md)           |

## Key Features

- Rapid Development: Create Serverless APIs quickly and efficiently, reducing code complexity and speeding up the development process.

- Integration with AWS CDK: The library is built on top of AWS Cloud Development Kit (CDK) with TypeScript, making it powerful and highly customizable.

- Complex Queries: Execute advanced database queries without the need to manage additional infrastructure.

- Integration with API Gateway: Leverage the scalability and security provided by AWS API Gateway.

- User-Friendly: Provide a simplified interface for developers, allowing them to focus on API functionality rather than detailed AWS CDK configuration.

## Installation

To use `@jsnova/core`, you need to have Node.js and npm installed on your machine. Then, install the library with the following command:

<code>pnpm install @jsnova/core</code>
