require('dotenv').config();

module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: process.env.DB_PATH || ':memory:' // Configura o banco de dados em memória
    },
    useNullAsDefault: true,
    migrations: {
      directory: './migrations' // Define o diretório das migrações, se necessário
    },
    seeds: {
      directory: './seeds' // Define o diretório das seeds, se necessário
    }
  },
  production: {
    client: 'sqlite3',
    connection: {
      filename: './data/database.sqlite' // Altere para persistente no ambiente de produção
    },
    useNullAsDefault: true
  }
};
