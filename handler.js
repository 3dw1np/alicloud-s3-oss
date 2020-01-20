'use strict';

const AWS = require('aws-sdk');

const s3 = new AWS.S3();

const s3BucketName = process.env.S3_BUCKET_NAME

module.exports.replicate = async event => {
  if (!s3BucketName) {
    context.fail('Error: Environment variable S3_BUCKET_NAME missing')
    return
  }
  if (event.Records === null) {
    context.fail('Error: Event has no records.')
    return
  }

  let tasks = []
  for (let i = 0; i < event.Records.length; i++) {
    tasks.push(replicatePromise(event.Records[i]))
  }

  Promise.all(tasks)
    .then(() => { context.succeed() })
    .catch(() => { context.fail() })
};

function replicatePromise(record) {
  return new Promise((resolve, reject) => {
    const srcBucket = record.s3.bucket.name
    const srcKey = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "))

    const destBucket = 'OSS';
    const destKey = 'null';

    var msg = 'Copying from S3 ' + srcBucket + ':' + srcKey + ' to OOS ' + destBucket + ':' + destKey;

    console.log('Attempting: ' + msg)
  })
}