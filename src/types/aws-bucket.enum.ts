import { config } from '../config';


export class Bucket {
  static get (): {
    CONTENT_FILE: string,
    CONTENT_TEXT: string,
    EVENT_IMG: string,
  } {
    const buckets = config().awsBuckets;
    const result = Object.freeze({
      CONTENT_FILE: buckets.fileBucketName,
      CONTENT_TEXT: buckets.textBucketName,
      EVENT_IMG: buckets.eventImgsBucketName,
    });
    return result;
  }
}
