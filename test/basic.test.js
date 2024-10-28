import request from 'supertest';
import { server } from '../app'; // Importar o servidor

describe('Basic API Tests', () => {
    afterAll((done) => {
        server.close(done); // Fecha o servidor após os testes
    });

    test('GET / should respond with a 200 status', async () => {
        const response = await request(server).get('/'); // Usar o servidor
        expect(response.status).toBe(200); // Verifica se a resposta é 200
    });

    test('GET /api-docs should respond with a 200 status', async () => {
        const response = await request(server).get('/api-docs'); // Usar o servidor
        expect(response.status).toBe(200); // Verifica se a resposta é 200
    });
});
