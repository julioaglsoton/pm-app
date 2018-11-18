var aws = require('aws-sdk');
var ses = new aws.SES({ region: 'us-west-2' });
import { success, failure } from "./libs/response-lib";

export async function main(event, context, callback) {
	// serverless invoke local --function send-mail
	// serverless invoke local --function send-mail --path mocks/send-mail.json
	
	var eParams = {
	Destination: { ToAddresses: ["jagl1n18@soton.ac.uk"] },
		Message: 
		{
			Body: { Text: { Data: "Body of email" } },
			Subject: { Data: "Subject" } 
		},
		Source: "jagl1n18@soton.ac.uk"
	};
	
	try {
		var email = ses.sendEmail(eParams, function(err, data)
			{
				if(err)	{
					console.log(err);
				}
				else {
					context.succeed(event);
				}
			});
		callback(null, success());
	} catch (e) {
		callback(null, failure({ status: false }));
	}

};
