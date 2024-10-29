import request from 'supertest';
import { server } from '../app';
import db from '../db';

// Função para criar a tabela de filmes e carregar dados de teste
function loadTestData() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Cria a tabela e insere dados específicos
            db.run(`CREATE TABLE IF NOT EXISTS movies (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                year INTEGER,
                title TEXT,
                studios TEXT,
                producers TEXT,
                winner INTEGER
            )`);

            db.run(`DELETE FROM movies`);

            // Insere dados de teste que irão resultar em intervalos de 1 e 13
            db.run(`INSERT INTO movies (year, title, studios, producers, winner) VALUES
                (1980, 'Movie A', 'Studio A', 'Producer A', 1),
                (1981, 'Movie B', 'Studio B', 'Producer A', 1),  -- Intervalo de 1 ano
                (1990, 'Movie C', 'Studio C', 'Producer B', 1),
                (2003, 'Movie D', 'Studio D', 'Producer B', 1),  -- Intervalo de 13 anos
                (2005, 'Movie E', 'Studio E', 'Producer C', 1),
                (2010, 'Movie F', 'Studio F', 'Producer C', 1)
            `, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    });
}

describe('API Integration Tests', () => {
    beforeAll(async () => {
        await loadTestData(); // Carrega os dados antes dos testes
    });

    afterAll((done) => {
        server.close(done); // Fecha o servidor após os testes
    });

    test('GET /producers/intervals should return expected intervals', async () => {
        const response = await request(server).get('/producers/intervals');
        expect(response.status).toBe(200);
    
        const expectedResponse = {
            min: [{ producer: 'Producer A', interval: 1, previousWin: 1980, followingWin: 1981 }],
            max: [{ producer: 'Producer B', interval: 13, previousWin: 1990, followingWin: 2003 }]
        };
    
        expect(response.body).toEqual(expectedResponse);
    });
    test('GET / should respond with a 200 status', async () => {
        const response = await request(server).get('/'); // Usar o servidor
        expect(response.status).toBe(200); // Verifica se a resposta é 200
    });
});
