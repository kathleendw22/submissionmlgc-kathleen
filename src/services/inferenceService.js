const tf = require('@tensorflow/tfjs-node');
const InputError = require('../exceptions/InputError');
const { Firestore } = require('@google-cloud/firestore');

const firestore = new Firestore();
async function predictClassification(model, image) {
    try {
        const tensor = tf.node
            .decodeJpeg(image)
            .resizeNearestNeighbor([224, 224])
            .expandDims()
            .toFloat()
 
        const prediction = model.predict(tensor);
        const classResult = prediction.dataSync()[0];
        const label = classResult > 0.5 ? 'Cancer' : 'Non-cancer';

        let suggestion;
        if (label == "Cancer") {
            suggestion = "Segera periksa ke dokter!";
        } else {
            suggestion = "Selamat! Anda dalam kondisi sehat.";
        }

        return {label, suggestion};
    } catch (error) {
        throw new InputError(`Terjadi kesalahan dalam melakukan prediksi`)
    }
}
async function getPredictionHistories() {
    const snapshot = await firestore.collection('predictions').get();
    const histories = [];

    snapshot.forEach(doc => {
        const data = doc.data();
        const { id, result, createdAt, suggestion } = data;
        histories.push({
            id,
            history: {
                result,
                createdAt,
                suggestion,
            }
        });
    });

    return histories;
}
module.exports = { predictClassification, getPredictionHistories };