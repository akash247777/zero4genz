let roomEvents = [];

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { room = 'live-debate', since = 0 } = req.query;

  if (req.method === 'POST') {
    const event = req.body;
    if (event) {
      event.timestamp = Date.now();
      roomEvents.push(event);
      if (roomEvents.length > 60) {
        roomEvents = roomEvents.slice(-60);
      }
    }
    return res.status(200).json({ success: true, count: roomEvents.length });
  }

  if (req.method === 'GET') {
    const sinceTime = parseInt(since, 10) || 0;
    const newEvents = roomEvents.filter(e => (!e.room || e.room === room) && e.timestamp > sinceTime);
    return res.status(200).json({
      room,
      now: Date.now(),
      events: newEvents
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
