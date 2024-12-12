const { PrismaClient } = require('@prisma/client');

let prisma;

if (process.env.USE_LOCAL_SQL === 'true') {
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
  dbType = 'mysql';
} else {
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.MONGODB_URI,
      },
    },
  });
  dbType = 'mongodb';
}

module.exports = prisma;