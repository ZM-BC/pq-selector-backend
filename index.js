const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

function recommendPQC({ usecase, platform, priority, algorithm_type }) {
  if (algorithm_type === 'kem') {
    if (priority === 'speed') return 'Recommended KEM: Kyber768 (NIST Standard)';
    if (priority === 'footprint') return 'Recommended KEM: FrodoKEM-640 or BIKE';
    return 'Recommended KEM: Kyber768 (Balanced Security & Performance)';
  }

  if (algorithm_type === 'signature') {
    if (usecase === 'digital_signing') return 'Recommended Signature: Dilithium (NIST Standard)';
    if (platform === 'embedded') return 'Recommended Signature: SPHINCS+ (Stateless Hash-based)';
    return 'Recommended Signature: Falcon or Dilithium (Depending on Resource Constraints)';
  }

  if (algorithm_type === 'both') {
    return 'Recommended: KEM = Kyber768, Signature = Dilithium2';
  }

  return 'No specific recommendation found. Please review input.';
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
