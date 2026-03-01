// Este wrapper elimina a necessidade de escrever try/catch em todo o lado
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;