interface IOptsAtlasHandler {
  database: string;
  dataSource: string;
  collection: string;
  filter: any;
  url: string;
  apiKey: string;
}

export const handler = async (event: IOptsAtlasHandler) => {
  var url = event.url;

  const data: any = Object.assign({}, event);

  delete data.url;
  delete data.apiKey;

  const res = await fetch(url, {
    method: "post",
    body: JSON.stringify(data),
    headers: {
      "api-key": event.apiKey,
      "Content-Type": "application/json",
    },
  });
  const body = await res.text();
  const response = {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
    },
    body,
  };

  return response;
};
