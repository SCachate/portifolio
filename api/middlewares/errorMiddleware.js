const errorHandler = (err, req, res, next) => {
    console.error('❌ Erro detetado:', err.stack);

    // Se o erro for de violação de chave estrangeira no MariaDB/MySQL
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({
            success: false,
            message: 'Não é possível eliminar: este registo está a ser usado noutra tabela.'
        });
    }

    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Erro interno no servidor'
    });
};

module.exports = errorHandler;