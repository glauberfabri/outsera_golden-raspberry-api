require('dotenv').config();
const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const { check, validationResult } = require('express-validator');
const NodeCache = require('node-cache');

const db = require('./db');
const producerRoutes = require('./routes/producerRoutes');
const { calculateIntervals } = require('./services/producerService'); // Importa calculateIntervals

const app = express();
const PORT = process.env.PORT || 3000;
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

// Configuração do Helmet para segurança
app.use(helmet());

// Configuração do limite de requisições
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use(limiter);

// Middleware para parse de JSON
app.use(express.json());
// Servir arquivos estáticos da pasta 'public'
app.use(express.static('public'));

// Rota para a página inicial
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Configuração do Swagger
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Golden Raspberry API',
            version: '1.0.0',
            description: 'API para consultar vencedores do Golden Raspberry Awards',
            contact: {
                name: 'Desenvolvedor',
                email: 'dev@example.com'
            }
        },
        servers: [
            {
                url: `http://localhost:${PORT}`,
                description: 'Servidor de Desenvolvimento'
            }
        ]
    },
    apis: ['./routes/*.js', './app.js']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Função para carregar os dados do CSV e inseri-los no banco de dados ao iniciar
function loadMoviesData() {
    fs.createReadStream('./data/movies.csv')
        .pipe(csv({ separator: ';' }))
        .on('data', (row) => {
            const { year, title, studios, producers, winner } = row;
            db.run(`INSERT INTO movies (year, title, studios, producers, winner) VALUES (?, ?, ?, ?, ?)`,
                [year, title, studios, producers, winner && winner.trim().toLowerCase() === 'yes' ? 1 : 0]);
        })
        .on('end', () => {
            db.all('SELECT * FROM movies', [], (err, rows) => {
                if (err) throw err;
                //console.log("Dados da tabela 'movies':", rows);
            });
        });
}

// Remover qualquer tabela existente e recriá-la para garantir que sempre comece do zero
db.serialize(() => {
    db.run(`DROP TABLE IF EXISTS movies`, (err) => {
        if (!err) {
            db.run(`CREATE TABLE movies (
                id INTEGER PRIMARY KEY,
                year INTEGER,
                title TEXT,
                studios TEXT,
                producers TEXT,
                winner INTEGER
            )`, (err) => {
                if (!err) {
                    loadMoviesData();
                }
            });
        }
    });
});

/**
 * @swagger
 * /movies:
 *   post:
 *     summary: Adiciona um novo filme
 *     tags: [Movies]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               year:
 *                 type: integer
 *                 example: 1980
 *               title:
 *                 type: string
 *                 example: "Can't Stop the Music"
 *               studios:
 *                 type: string
 *                 example: "Associated Film Distribution"
 *               producers:
 *                 type: string
 *                 example: "Allan Carr"
 *               winner:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Filme adicionado com sucesso
 *       400:
 *         description: Erro de validação
 *       500:
 *         description: Erro interno do servidor
 */
app.post('/movies', [
    check('year').isInt({ min: 1900, max: new Date().getFullYear() }).withMessage('Ano deve ser um número válido.'),
    check('title').notEmpty().withMessage('Título é obrigatório.'),
    check('studios').notEmpty().withMessage('Estúdio é obrigatório.'),
    check('producers').notEmpty().withMessage('Produtor é obrigatório.'),
    check('winner').isBoolean().withMessage('Winner deve ser verdadeiro (true) ou falso (false).')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { year, title, studios, producers, winner } = req.body;
    db.run(`INSERT INTO movies (year, title, studios, producers, winner) VALUES (?, ?, ?, ?, ?)`,
        [year, title, studios, producers, winner ? 1 : 0], (err) => {
            if (err) {
                return res.status(500).json({ error: 'Erro ao inserir o filme no banco de dados' });
            }
            res.status(201).json({ message: 'Filme adicionado com sucesso' });
        });
});

// Endpoint com cache para listar intervalos dos produtores
app.get('/producers/intervals', (req, res) => {
    const cachedIntervals = cache.get('intervals');

    if (cachedIntervals) {
        return res.json(cachedIntervals);
    }

    calculateIntervals((intervals) => {
        cache.set('intervals', intervals);
        res.json(intervals);
    });
});

// Definição das rotas principais
app.use('/producers', producerRoutes);

// Middleware para rotas inválidas (404)
app.use((req, res, next) => {
    res.status(404).json({ error: 'Router not found' });
});

// Middleware para tratamento de erros gerais (500)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Fixed an internal server error' });
});

// Inicialização do servidor
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Exportar o app e o servidor para testes
module.exports = { app, server };
