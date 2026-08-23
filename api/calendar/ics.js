import ical from 'ical-generator';

function slugify(text) {
  return text.toString().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-');
}

export default function handler(req, res) {
  const { name, startTime, endTime, url, platform } = req.query;

  if (!name || !startTime || !endTime) {
    return res.status(400).send('Missing params');
  }

  const calendar = ical({ name: 'CP Contest Tracker' });
  const event = calendar.createEvent({
    start: new Date(startTime),
    end: new Date(endTime),
    summary: `[${platform || 'CP'}] ${name}`,
    description: `Join contest: ${url || ''}\nTracked via CodePulse.`,
    url: url || '',
    location: platform || 'Online',
  });

  event.createAlarm({
    type: 'display',
    trigger: 1800,
    description: `Reminder: ${name} starts in 30 minutes!`,
  });

  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${slugify(name)}.ics"`);
  res.status(200).send(calendar.toString());
}
