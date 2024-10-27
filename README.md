# Golden Raspberry API

Este projeto é uma API RESTful que permite consultar informações sobre os vencedores da categoria "Pior Filme" do Golden Raspberry Awards. A API processa um arquivo CSV com os dados dos filmes, identifica os produtores que venceram em diferentes anos, e calcula o intervalo de tempo entre suas vitórias consecutivas.

## Funcionalidades

- **Carregar dados CSV**: Lê um arquivo CSV com informações sobre filmes indicados e vencedores, inserindo esses dados em um banco de dados em memória.
- **Endpoint de consulta**: Fornece um endpoint que retorna o produtor com o maior intervalo entre vitórias consecutivas e o produtor que obteve duas vitórias consecutivas mais rapidamente.
- **Documentação Swagger**: Interface interativa para explorar e testar os endpoints.
- **Cache**: Implementação de cache para otimizar a resposta dos endpoints que retornam dados que não mudam com frequência.
- **Segurança**: Proteção com `helmet` e limite de requisições com `express-rate-limit`.


## Tecnologias Utilizadas

- **Node.js**: Ambiente de execução.
- **Express.js**: Framework para criar a API RESTful.
- **SQLite (em memória)**: Banco de dados em memória, simula o funcionamento de um banco persistente, mas apenas durante a execução.
- **csv-parser**: Biblioteca para processar o arquivo CSV.
- **Swagger**: Documentação interativa da API.
- **node-cache**: Cache de dados para otimizar o desempenho dos endpoints.
- **helmet**: Middleware de segurança para proteção contra vulnerabilidades comuns.
- **express-rate-limit**: Limitação de requisições para proteger a API contra ataques de força bruta.
- **Mocha/Chai**: Ferramentas para testes de integração.

## Estrutura do Projeto

O projeto está estruturado da seguinte forma:

```plaintext
golden-raspberry-api/
├── app.js                  # Arquivo principal que inicializa o servidor
├── db.js                   # Configuração do banco de dados SQLite em memória
├── knexfile.js             # Configuração do Knex para migrações e seeds  ##### RETIRADO ######
├── routes/
│   └── producerRoutes.js   # Define as rotas da API
├── services/
│   └── producerService.js  # Lógica de negócio para cálculo de intervalos
├── utils/
│   └── logger.js           # Configuração e instância de log   ############# Retirado ############
├── data/
│   └── movies.csv          # Arquivo CSV com os dados dos filmes
├── migrations/             # Diretório para as migrações do Knex
├── seeds/                  # Diretório para os seeds do Knex
├── README.md               # Documentação do projeto
└── package.json            # Gerenciador de pacotes e dependências

Documentação da API
A documentação Swagger pode ser acessada em http://localhost:3000/api-docs enquanto o servidor está em execução. Esta interface permite explorar e testar os endpoints da API, além de visualizar os parâmetros aceitos e os formatos de resposta.

Endpoints Principais
GET /producers/intervals
Este endpoint retorna os intervalos de vitórias dos produtores do Golden Raspberry Awards, com informações sobre o maior intervalo entre vitórias consecutivas e o menor intervalo entre vitórias consecutivas para cada produtor.

Cache: Os resultados são armazenados em cache por 10 minutos usando node-cache, melhorando o desempenho para consultas repetidas.
POST /movies
Adiciona um novo filme à lista de vencedores com validação dos dados de entrada.

Parâmetros de entrada (JSON):

year: Ano do filme (inteiro, obrigatório)
title: Título do filme (string, obrigatório)
studios: Estúdio(s) do filme (string, obrigatório)
producers: Produtor(es) do filme (string, obrigatório)
winner: Indica se o filme foi vencedor (booleano, obrigatório)


Funcionalidades Adicionais
Cache com Node-Cache
Utilizamos node-cache para armazenar em cache os resultados do endpoint /producers/intervals, garantindo que dados com pouca alteração não sejam recalculados repetidamente. O cache é configurado com um TTL (tempo de vida) de 10 minutos.

Segurança com Helmet e Express-Rate-Limit
Helmet: Adiciona cabeçalhos de segurança à resposta HTTP para ajudar a proteger contra ataques comuns.
Express-Rate-Limit: Limita o número de requisições que podem ser feitas em uma janela de 15 minutos, ajudando a prevenir ataques de força bruta e abuso da API.

#####################################################
Como Configurar e Rodar o Projeto
1. Clonar o Repositório
Para começar, clone o repositório para o seu computador com o comando:

git clone <URL_DO_REPOSITORIO>
cd golden-raspberry-api

2. Instalar as Dependências
Em seguida, instale as dependências necessárias para rodar o projeto:
npm install

3. Executar a Aplicação
Agora é só iniciar a aplicação. Esse comando irá iniciar o servidor, ler o arquivo CSV e carregar os dados no banco de dados em memória.
npm start

A API estará rodando em http://localhost:3000.

4. Endpoints Disponíveis
GET /producers/intervals
Este é o endpoint principal, onde você pode consultar os produtores com o maior e o menor intervalo entre vitórias consecutivas na categoria "Pior Filme".

Exemplo de Requisição:


curl http://localhost:3000/producers/intervals

Exemplo de Resposta:

{
  "min": [
    {
      "producer": "Producer 1",
      "interval": 1,
      "previousWin": 2008,
      "followingWin": 2009
    }
  ],
  "max": [
    {
      "producer": "Producer 2",
      "interval": 99,
      "previousWin": 1900,
      "followingWin": 1999
    }
  ]
}

Executando os Testes
Para garantir que a API está funcionando corretamente, você pode rodar os testes de integração. Esses testes verificam, por exemplo, se o CSV é carregado e se o endpoint /producers/intervals responde conforme esperado.

npm test

Estrutura do Arquivo CSV
O arquivo movies.csv deve estar no seguinte formato:


year,title,studios,producers,winner
1980,Cruising,Lorimar Productions,Producer 1,yes
1985,Howard the Duck,Lucasfilm,Producer 1,yes
2000,Battlefield Earth,Franchise Pictures,Producer 2,yes
year: Ano de lançamento do filme.
title: Nome do filme.
studios: Estúdio responsável.
producers: Nome(s) dos produtores, separados por vírgula se houver mais de um.
winner: Indica se o filme foi o vencedor na categoria ("yes" para vencedor).

Estrutura de Resposta do Endpoint
A resposta JSON do endpoint /producers/intervals é organizada em duas seções: min e max, contendo o produtor com o menor intervalo entre vitórias e o com o maior intervalo, respectivamente:


{
  "min": [
    {
      "producer": "Nome do Produtor",
      "interval": Anos entre vitórias,
      "previousWin": Ano da primeira vitória,
      "followingWin": Ano da segunda vitória
    }
  ],
  "max": [
    {
      "producer": "Nome do Produtor",
      "interval": Anos entre vitórias,
      "previousWin": Ano da primeira vitória,
      "followingWin": Ano da segunda vitória
    }
  ]
}

############################################################################################################################################################################
Considerações Finais
Banco de Dados em Memória: Os dados são armazenados temporariamente enquanto a aplicação está em execução e são apagados ao fechar o servidor.
Tolerância a Variantes de Dados: A API foi projetada para lidar com diferentes dados de entrada, para que mantenha a precisão independente do conjunto de dados utilizado.