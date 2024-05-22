require('dotenv').config();
const Hapi = require('@hapi/hapi');
const routes = require('../server/routes');
const loadModel = require('../services/loadModel');
const InputError = require('../exceptions/InputError');

(async () => {
    const server = Hapi.server({
        port: 3000,
        host: '0.0.0.0',
        routes: {
            cors: {
                origin: ['*'],
            },
            payload: {
                maxBytes: 1000000,
            },
        },
    });

    const model = await loadModel();
    server.app.model = model;

    server.route(routes);

    server.ext('onPreResponse', function (request, h) {
        const response = request.response;
        if (response instanceof InputError) {
            // Handling InputError
            const newResponse = h.response({
                status: 'fail',
                message: `${response.message}`
            });
            newResponse.code(400); // Setting status code to 400
            return newResponse;
        }

        if (response.isBoom) {
            // Handling Boom errors (e.g., when model prediction fails)
            const newResponse = h.response({
                status: 'fail',
                message: response.message
            });
            newResponse.code(response.output.statusCode); // Setting status code
            return newResponse;
        }
        if (response.statusCode === 400 && response.message === 'Prediction error') {
            const newResponse = h.response({
                status: 'fail',
                message: 'Terjadi kesalahan dalam melakukan prediksi'
            });
            newResponse.code(400); // Setting status code to 400
            return newResponse;
        }
        if (response.statusCode === 413) {
            const newResponse = h.response({
                status: 'fail',
                message: 'Payload content length greater than maximum allowed: 1000000'
            });
            newResponse.code(413); // Setting status code to 413
            return newResponse;
        }

        return h.continue;
    });

    await server.start();
    console.log(`Server start at: ${server.info.uri}`);
})();
