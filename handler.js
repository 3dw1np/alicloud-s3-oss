'use strict';

const AWS = require('aws-sdk');
const OSS = require('ali-oss');

const s3BucketName = process.env.S3_BUCKET_NAME
const ossBucketName = process.env.OSS_BUCKET_NAME

const s3Client = new AWS.S3();
const ossClient = new OSS({
  endpoint: process.env.ALICLOUD_OSS_ENDPOINT,
  region: process.env.ALICLOUD_REGION,
  accessKeyId: process.env.ALICLOUD_ACCESS_KEY,
  accessKeySecret: process.env.ALICLOUD_SECRET_KEY,
  bucket: ossBucketName
});

module.exports.replicate = async (event, context) => {
  if (!s3BucketName) {
    context.fail('ERROR: Environment variable S3_BUCKET_NAME missing')
    return
  }
  if (event.Records === null) {
    context.fail('ERROR: Event has no records.')
    return
  }

  let tasks = []
  for (let i = 0; i < event.Records.length; i++) {
    tasks.push(replicatePromise(event.Records[i]))
  }

  Promise.all(tasks)
    .then(() => { context.succeed() })
    .catch((err) => {
      console.error(err);
      context.fail();
    })
};

function replicatePromise(record) {
  return new Promise((resolve, reject) => {
    const srcBucket = record.s3.bucket.name
    const srcKey = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "))

    const destBucket = ossBucketName;
    const destKey = encodeURIComponent(srcKey);

    var msg = 'copying from S3 ' + srcBucket + ':' + srcKey + ' to OSS ' + destBucket + ':' + destKey;
    console.log('Attempting ' + msg)

    const params = { Bucket: srcBucket, Key: srcKey };
    const s3StreamFile = s3Client.getObject(params).createReadStream();
    s3StreamFile.on('error', function(err) {
      console.error(err);
    });

    const result = await ossClient.putStream(destKey, s3StreamFile);
    console.log(result);
    resolve(result);

  })
}