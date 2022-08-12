import { Content } from '../src/contents/entities/content.entity';
const env = process.env;

export const config = () => ({
  database: {
    type: 'mysql',
    host: env.HOST ?? 'localhost',
    port: 3307,
    username: 'test',
    password: 'test',
    database: 'test',
    synchronize: true,
    logging: false,
    entities: [Content],
  }
});