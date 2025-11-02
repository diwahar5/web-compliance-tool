// Using express with type inference for route handlers.
import express from 'express';
import cors from 'cors';
import { scanWebsite } from './scanner';
import { mapViolations } from './mapper';

// By letting TypeScript infer the type of `app`, it correctly uses the `Express` interface,
// which is more specific than `Application` and resolves the type errors.
const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());

// FIX: To resolve type errors, we now rely on Express's built-in type inference
// for the request and response objects instead of explicit typing.
app.post('/api/scan', async (req, res) => {
  const { url } = req.body as { url: string };

  if (!url) {
    return res.status(400).json({ detail: 'URL is required' });
  }

  try {
    console.log(`Starting scan for: ${url}`);
    const rawData = await scanWebsite(url);
    console.log('Raw data extracted, mapping violations...');
    const analysisResult = mapViolations(rawData, url);
    console.log(`Scan for ${url} complete. Found ${analysisResult.violations.length} violations.`);
    
    return res.json(analysisResult);

  } catch (error) {
    console.error(`Error scanning ${url}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during the scan.';
    return res.status(500).json({ detail: `Failed to scan website. ${errorMessage}` });
  }
});

app.listen(port, () => {
  console.log(`Backend server is running at http://127.0.0.1:${port}`);
});
