const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

function recommendPQC(input) {
  const {
    usecase,
    platform,
    priority,
    algorithm_type,
    security_level,
    compatibility,
    size_limit,
    crypto_basis,
    mypqc
  } = input;

  let kem = '', sig = '', notes = [];

  // Signature Recommendation
  if (algorithm_type === 'signature' || algorithm_type === 'both') {
    if (crypto_basis === 'hash' || platform === 'embedded') {
      sig = 'SPHINCS+';
    } else if (crypto_basis === 'code') {
      sig = 'Classic McEliece (Signature mode - draft)';
    } else if (priority === 'speed') {
      sig = 'Falcon';
    } else {
      sig = 'Dilithium';
    }

    if (size_limit === 'sig1k' && sig === 'SPHINCS+') {
      notes.push('SPHINCS+ has large signature size, not ideal for this constraint. Consider Falcon.');
    }

    if (mypqc === 'yes') {
      sig = 'Dilithium (disenarai MyPQC)';
    }
  }

  // KEM Recommendation
  if (algorithm_type === 'kem' || algorithm_type === 'both') {
    if (crypto_basis === 'code') {
      kem = 'Classic McEliece';
    } else if (priority === 'footprint') {
      kem = 'BIKE or HQC';
    } else {
      kem = 'Kyber';
    }

    if (security_level === 'level5') {
      kem = kem + ' (Level 5)';
    }

    if (mypqc === 'yes') {
      kem = 'Kyber (disenarai MyPQC)';
    }
  }

  // Output response
  let recommendation = '';
  if (algorithm_type === 'both') {
    recommendation = `KEM: ${kem}, Signature: ${sig}`;
  } else if (algorithm_type === 'kem') {
    recommendation = `KEM: ${kem}`;
  } else {
    recommendation = `Signature: ${sig}`;
  }

  if (notes.length > 0) {
    recommendation += `\n\nNota: ${notes.join(' ')}`;
  }

  return recommendation;
}

app.post('/recommend', (req, res) => {
  const input = req.body;
  const result = recommendPQC(input);
  res.json({ recommendation: result });
});

app.get('/', (req, res) => res.send('PQC Selector API is running'));

app.listen(process.env.PORT || 3000, () => {
  console.log('Server running');
});
