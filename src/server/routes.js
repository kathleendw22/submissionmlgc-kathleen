const { postPredictHandler , getPredictionHistoriesHandler} = require('../server/handler');
const routes = [
  {
    path: '/predict',
    method: 'POST',
    handler: postPredictHandler,
    options: {
      payload: {
        maxBytes: 1000000, 
        multipart: true, 
        allow: 'multipart/form-data',
      },
    },
  },
  {
    path: '/predict/histories', // New endpoint path
    method: 'GET',
    handler: getPredictionHistoriesHandler, // Handler for fetching prediction histories
  },
];

module.exports = routes;
