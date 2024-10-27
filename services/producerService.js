const db = require('../db');

// Função para calcular os intervalos de prêmios
function calculateIntervals(callback) {
    const query = `SELECT producers, year FROM movies WHERE winner = 1 ORDER BY year`;

    db.all(query, [], (err, rows) => {
        if (err) {
            throw err;
        }

        // Exibir os dados carregados de vencedores
        console.log("Registros de vencedores carregados:", rows);

        // Estrutura para armazenar os anos de vitória de cada produtor
        const producerWins = {};
        rows.forEach(row => {
            // Dividir a lista de produtores e remover espaços em branco
            const producersList = row.producers.split(',').map(p => p.trim());
            producersList.forEach(producer => {
                if (!producerWins[producer]) {
                    producerWins[producer] = [];
                }
                producerWins[producer].push(row.year);
            });
        });

        console.log("Dados dos produtores com vitórias:", producerWins);

        // Estruturas para armazenar os intervalos mínimo e máximo
        const intervals = { min: [], max: [] };

        // Calcular os intervalos para cada produtor
        Object.keys(producerWins).forEach(producer => {
            const wins = producerWins[producer];
            if (wins.length > 1) { // Apenas se o produtor tiver mais de uma vitória
                for (let i = 1; i < wins.length; i++) {
                    const interval = wins[i] - wins[i - 1];
                    intervals.min.push({ producer, interval, previousWin: wins[i - 1], followingWin: wins[i] });
                    intervals.max.push({ producer, interval, previousWin: wins[i - 1], followingWin: wins[i] });
                }
            }
        });

        // Ordenar para encontrar o intervalo mínimo e máximo
        intervals.min.sort((a, b) => a.interval - b.interval);
        intervals.max.sort((a, b) => b.interval - a.interval);

        // Exibir os intervalos calculados para debug
        console.log("Intervalos mínimos calculados:", intervals.min);
        console.log("Intervalos máximos calculados:", intervals.max);

        // Retornar apenas os primeiros elementos de min e max, que são os menores e maiores intervalos
        callback({
            min: intervals.min.length > 0 ? [intervals.min[0]] : [null],
            max: intervals.max.length > 0 ? [intervals.max[0]] : [null]
        });
    });
}

module.exports = {
    calculateIntervals
};
