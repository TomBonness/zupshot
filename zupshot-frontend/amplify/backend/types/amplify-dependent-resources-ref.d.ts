export type AmplifyDependentResourcesAttributes = {
  "api": {
    "zupshotapi": {
      "GraphQLAPIEndpointOutput": "string",
      "GraphQLAPIIdOutput": "string"
    }
  },
  "auth": {
    "zupshotlogin": {
      "AppClientID": "string",
      "AppClientIDWeb": "string",
      "IdentityPoolId": "string",
      "IdentityPoolName": "string",
      "UserPoolArn": "string",
      "UserPoolId": "string",
      "UserPoolName": "string"
    }
  },
  "storage": {
    "zupshotimages": {
      "BucketName": "string",
      "Region": "string"
    }
  }
}