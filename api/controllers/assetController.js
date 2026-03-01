const db = require('../config/db');

// Busca todos os ativos, corretoras e classes para preencher os "Selects" da tela
exports.getFormData = async (req, res) => {
    try {
        const [assets] = await db.execute('SELECT id, ticket, description FROM assets');
        const [brokers] = await db.execute('SELECT id, name FROM brokers');
        const [classes] = await db.execute('SELECT id, name FROM investment_classes WHERE userId = ?', [req.params.userId]);
        
        res.json({ assets, brokers, classes });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Registra a transação (O Trigger cuidará do resto)
exports.addTransaction = async (req, res) => {
    const { userId, assetId, brokerId, quantity, priceUnit, fees } = req.body;
    try {
        // O trigger tr_update_balance_after_transaction fará o cálculo do PM e saldo
        await db.execute(
            'INSERT INTO transactions (userId, assetId, brokerId, quantity, priceUnit, fees) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, assetId, brokerId, quantity, priceUnit, fees]
        );
        res.json({ success: true, message: 'Transação processada com sucesso!' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};