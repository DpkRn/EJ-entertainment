/**
 * Standalone health check – proves that serverless API is deployed.
 */
export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({
    status: 'ok',
    message: 'Server is running',
    source: 'api/health.js',
  });
}
