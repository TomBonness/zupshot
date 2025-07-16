/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateProfile = /* GraphQL */ `
  subscription OnCreateProfile($filter: ModelSubscriptionProfileFilterInput) {
    onCreateProfile(filter: $filter) {
      id
      name
      location
      price
      description
      imageUrls
      portfolioImages
      availability
      pricingDetails
      instagram
      website
      owner
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onUpdateProfile = /* GraphQL */ `
  subscription OnUpdateProfile($filter: ModelSubscriptionProfileFilterInput) {
    onUpdateProfile(filter: $filter) {
      id
      name
      location
      price
      description
      imageUrls
      portfolioImages
      availability
      pricingDetails
      instagram
      website
      owner
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onDeleteProfile = /* GraphQL */ `
  subscription OnDeleteProfile($filter: ModelSubscriptionProfileFilterInput) {
    onDeleteProfile(filter: $filter) {
      id
      name
      location
      price
      description
      imageUrls
      portfolioImages
      availability
      pricingDetails
      instagram
      website
      owner
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onCreateFeedback = /* GraphQL */ `
  subscription OnCreateFeedback($filter: ModelSubscriptionFeedbackFilterInput) {
    onCreateFeedback(filter: $filter) {
      id
      rating
      comment
      profileId
      owner
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onUpdateFeedback = /* GraphQL */ `
  subscription OnUpdateFeedback($filter: ModelSubscriptionFeedbackFilterInput) {
    onUpdateFeedback(filter: $filter) {
      id
      rating
      comment
      profileId
      owner
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const onDeleteFeedback = /* GraphQL */ `
  subscription OnDeleteFeedback($filter: ModelSubscriptionFeedbackFilterInput) {
    onDeleteFeedback(filter: $filter) {
      id
      rating
      comment
      profileId
      owner
      createdAt
      updatedAt
      __typename
    }
  }
`;
