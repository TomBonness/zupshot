export type AmplifyDependentResourcesAttributes = {
  "api": {
    "zupshot": {
      "GraphQLAPIEndpointOutput": "string",
      "GraphQLAPIIdOutput": "string"
    }
  },
  "auth": {
    "zupshotAuthCategory": {
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
    "zupshotStorageCategory": {
      "BucketName": "string",
      "Region": "string"
    }
  }
}