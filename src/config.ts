import { Content } from './contents/entities/content.entity';
import { Transcription } from './contents/entities/transcription.entity';
const env = process.env;

export const config = () => ({
  database: {
    type: 'mysql',
    host: env.DB_HOST ?? 'localhost',
    port: Number(env.DB_PORT) ?? 3306,
    username: env.DB_USERNAME ?? 'user',
    password: env.DB_PASSWORD ?? 'password',
    database: env.DB_NAME ?? 'firstapp',
    synchronize: true,
    logging: false,
    entities: ['dist/**/entities/*.entity.js'],
  },
  url: env.URL,
  aws: {
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY,
      secretAccessKey: env.AWS_SECRET_KEY,
    },
    region: env.AWS_BUCKET_REGION,
  },
  awsBuckets: {
    fileBucketName: env.AWS_BUCKET_NAME,
    textBucketName: env.AWS_TEXT_BUCKET_NAME,
    eventImgsBucketName: env.AWS_EVENT_IMGS_BUCKET_NAME,
  },
  databaseTest: {
    type: 'mysql',
    host: env.DB_HOST ?? 'localhost',
    port: 3307,
    username: env.TEST_DB_USERNAME ?? 'test',
    password: env.TEST_DB_PASSWORD ?? 'test',
    database: env.TEST_DB_NAME ?? 'test',
    synchronize: true,
    entities: [
      Content,
      Transcription,
    ],
  },
  mail: {
    from: env.MAIL_FROM,
    access: {
      service: env.MAIL_SERVICE,
      auth: {
        user: env.MAIL_USERNAME,
        pass: env.MAIL_PASSWORD
      }
    }
  },
  telegram: env.TELEGRAM_TOKEN,
  twitter: {
    appKey: env.TWITTER_APP_KEY,
    appSecret: env.TWITTER_APP_SECRET,
    accessToken: env.TWITTER_ACCESS_TOKEN,
    accessSecret: env.TWITTER_ACCESS_SECRET,
  }
});