const db = require('../db');

// Função para calcular os intervalos de prêmios
function calculateIntervals(callback) {
    const query = `SELECT producers, year FROM movies WHERE winner = 1 ORDER BY year`;

    db.all(query, [], (err, rows) => {
        if (err) {
            throw err;
        }

        console.log("Registros de vencedores carregados:", rows);

        const producerWins = {};
        rows.forEach(row => {
            const producersList = row.producers.split(',').map(p => p.trim());
            producersList.forEach(producer => {
                if (!producerWins[producer]) {
                    producerWins[producer] = [];
                }
                producerWins[producer].push(row.year);
            });
        });

        console.log("Dados dos produtores com vitórias:", producerWins);

        const allIntervals = [];

        Object.keys(producerWins).forEach(producer => {
            const wins = producerWins[producer];
            if (wins.length > 1) {
                for (let i = 1; i < wins.length; i++) {
                    const interval = wins[i] - wins[i - 1];
                    allIntervals.push({ producer, interval, previousWin: wins[i - 1], followingWin: wins[i] });
                }
            }
        });

        // Filtrar os intervalos mínimos e máximos
        const minInterval = Math.min(...allIntervals.map(i => i.interval));
        const maxInterval = Math.max(...allIntervals.map(i => i.interval));

        const minProducers = allIntervals.filter(i => i.interval === minInterval);
        const maxProducers = allIntervals.filter(i => i.interval === maxInterval);

        console.log("Intervalos mínimos calculados:", minProducers);
        console.log("Intervalos máximos calculados:", maxProducers);

        callback({
            min: minProducers.length > 0 ? minProducers : [],
            max: maxProducers.length > 0 ? maxProducers : []
        });
    });
}

module.exports = {
    calculateIntervals
};
