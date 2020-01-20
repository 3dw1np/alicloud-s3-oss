'use strict';

const AWS = require('aws-sdk');

const s3 = new AWS.S3();

module.exports.hello = async event => {
  console.log('Event:', event);
  return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};
