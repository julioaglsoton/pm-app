import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function main(event, context, callback) {
  const data = JSON.parse(event.body);
  const params = {
    TableName: "projects",
    Key: {
      id_prjt: event.pathParameters.id
    },
    UpdateExpression: "SET tx_prjt_name = :tx_prjt_name, tx_stts = :tx_stts",
    ExpressionAttributeValues: {
      ":tx_prjt_name": data.tx_prjt_name ? data.tx_prjt_name : null,
      ":tx_stts": data.tx_stts ? data.tx_stts : null
    },
    ReturnValues: "ALL_NEW"
  };

  try {
    const result = await dynamoDbLib.call("update", params);
    callback(null, success({ status: true }));
  } catch (e) {
    callback(null, failure({ status: false }));
  }
}
