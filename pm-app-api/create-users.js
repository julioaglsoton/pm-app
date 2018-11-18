import uuid from "uuid";
import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function main(event, context, callback) {
  const data = JSON.parse(event.body);
  const params = {
    TableName: "users",
    Item: {
      id_user: uuid.v1(),
      tx_user_name: data.tx_user_name,
      tx_role: data.tx_role,
      tx_user_mail: data.tx_user_mail,
      tx_stts: data.tx_stts
    }
  };

  try {
    await dynamoDbLib.call("put", params);
    callback(null, success(params.Item));
  } catch (e) {
    callback(null, failure({ status: false }));
  }
}
