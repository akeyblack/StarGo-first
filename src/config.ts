const env = process.env;

export const config = () => ({
  database: {
    type: 'mysql',
    host: env.HOST ?? 'localhost',
    port: Number(env.DB_PORT) ?? 3306,
    username: env.DB_USERNAME ?? 'user',
    password: env.DB_PASSWORD ?? 'password',
    database: env.DB_NAME ?? 'firstapp',
    synchronize: true,
    logging: false,
    entities: ['dist/**/entities/*.entity.js'],
  },
  awsBucket: {
    name: env.AWS_BUCKET_NAME,
    region: env.AWS_BUCKET_REGION,
    accessKeyId: env.AWS_ACCESS_KEY,
    secretAccessKey: env.AWS_SECRET_KEY,
  }
});