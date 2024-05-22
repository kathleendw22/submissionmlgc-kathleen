const { predictClassification, getPredictionHistories} = require('../services/inferenceService');
const crypto = require('crypto');
const storeData = require('../services/storeData');


async function postPredictHandler(request, h) {
  const { image } = request.payload;
  const { model } = request.server.app;
 
  const { label,suggestion } = await predictClassification(model, image);
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  const data = {
    "id": id,
    "result": label,
    "suggestion": suggestion,
    "createdAt": createdAt
  }
  await storeData(id, data);
  const response = h.response({
    status: 'success',
    message: 'Model is predicted successfully',
    data
  })
  
 
  response.code(201);
  return response;
}
async function getPredictionHistoriesHandler(request, h) {
    try {
        const histories = await getPredictionHistories();
        return {
            status: 'success',
            data: histories
        };
    } catch (error) {
        return {
            status: 'error',
            message: 'Failed to fetch prediction histories'
        };
    }
}

 
module.exports = { postPredictHandler, getPredictionHistoriesHandler};