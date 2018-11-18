import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function main(event, context, callback) {
  const params = {
    TableName: "users"
	, FilterExpression: "begins_with(tx_user_name, :tx_user_name)"
 	, ExpressionAttributeValues: { ":tx_user_name": event.body.tx_user_name }	
  };

  try {
    const result = await dynamoDbLib.call("scan", params);
    // Return the matching list of items in response body
    callback(null, success(result.Items));
  } catch (e) {
    callback(null, failure({ status: false }));
  }
}
