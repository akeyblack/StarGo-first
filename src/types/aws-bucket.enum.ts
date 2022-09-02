import { config } from '../config';


const buckets = config().awsBuckets;

export const Bucket = Object.freeze({
  CONTENT_FILE: buckets.fileBucketName,
  CONTENT_TEXT: buckets.textBucketName,

  EVENT_IMG: buckets.eventImgsBucketName,
});