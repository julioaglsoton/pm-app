import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function main(event, context, callback) {
	// serverless invoke local --function get-projects-by-name
	// serverless invoke local --function get-projects-by-name --path mocks/get-projects-by-name.json
  const data = JSON.parse(event.body);
  const params = {
    TableName: "projects"
	, FilterExpression: "begins_with(tx_prjt_name, :tx_prjt_name)"
	, ExpressionAttributeValues: { ":tx_prjt_name": data.tx_prjt_name }
  };

  try {
    const result = await dynamoDbLib.call("scan", params);
    // Return the matching list of items in response body
    callback(null, success(result.Items));
  } catch (e) {
    callback(null, failure({ status: false }));
  }
}
