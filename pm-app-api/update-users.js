import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function main(event, context, callback) {
  const data = JSON.parse(event.body);
  const params = {
    TableName: "users",
    Key: {
      id_user: event.pathParameters.id
    },
    UpdateExpression: "SET tx_user_name = :tx_user_name, tx_role = :tx_role, tx_user_mail = :tx_user_mail, tx_stts = :tx_stts",
    ExpressionAttributeValues: {
      ":tx_user_name": data.tx_user_name ? data.tx_user_name : null,
      ":tx_role": data.tx_role ? data.tx_role : null,
      ":tx_user_mail": data.tx_user_mail ? data.tx_user_mail : null,
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
