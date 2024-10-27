const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app'); // Importar a aplicação principal

chai.use(chaiHttp);
const { expect } = chai;

describe('API Integration Tests', () => {
    it('should return the producer with the smallest and largest intervals', (done) => {
        chai.request(app)
            .get('/producers/intervals')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('min');
                expect(res.body).to.have.property('max');
                done();
            });
    });
});
