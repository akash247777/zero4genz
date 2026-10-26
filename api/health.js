export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({
    status: 'ok',
    engine: 'TAKRAAR Duplex Argument Engine',
    deployedOn: 'Vercel Serverless',
    timestamp: new Date().toISOString()
  });
}
