import AWS from 'aws-sdk';

AWS.config.update({
  region: 'ap-south-1', // Replace with your AWS region
});

const cognitoIdentity = new AWS.CognitoIdentityServiceProvider();

export default cognitoIdentity;