import AWS from 'aws-sdk';

AWS.config.update({
  region: 'ap-south-1', 
});

const cognitoIdentity = new AWS.CognitoIdentityServiceProvider();

export default cognitoIdentity;
