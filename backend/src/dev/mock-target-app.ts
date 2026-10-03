import express from 'express';

export function createMockTarget() {
  const app = express();
  const unavailableAttempts = new Map<number, number>();
  app.use(express.urlencoded({ extended: false }));
  app.get('/v2.svc/reports/nearby/:coordinates', (req, res) => {
    const latitude = Number(String(req.params.coordinates).split(',')[0]);
    if (req.query.approvedonly !== 'false' || req.query.days !== '30')
      return res.status(400).json({ error: 'bad-query' });
    if (latitude === 51.7 || latitude === 51.71) {
      const attempts = unavailableAttempts.get(latitude) ?? 0;
      unavailableAttempts.set(latitude, attempts + 1);
      if (attempts === 0) return res.status(503).json({ error: 'unavailable' });
      return res.json([]);
    }
    if (latitude === 51.6) return res.json([]);
    if (latitude === 51.65)
      return res.json([
        {
          Id: 'closed-fly',
          CategoryId: 16144,
          Completed: true,
          CategoryName: 'Dumped or flytipped waste',
          StatusName: 'Closed',
        },
        {
          Id: 'other-open',
          CategoryId: 17450,
          Completed: false,
          CategoryName: 'Pavement obstruction',
          StatusName: 'Open',
        },
      ]);
    if (latitude === 51.66)
      return res.json([
        { Id: 'missing-category', Completed: false, CategoryName: 'Unknown', StatusName: 'Open' },
        {
          Id: 'invalid-completion',
          CategoryId: 16144,
          Completed: 'false',
          CategoryName: 'Dumped or flytipped waste',
          StatusName: 'Open',
        },
      ]);
    return res.json([
      {
        Id: 'nearby-1',
        CategoryId: 16144,
        Completed: false,
        CategoryName: 'Dumped or flytipped waste',
        DateTimeRecorded: '2026-10-03T10:00:00Z',
        Address: 'Example Street',
        StatusName: 'Open',
        Description: 'Approved waste report',
        Approved: true,
        Latitude: 51.538,
        Longitude: -0.102,
        Images: [{ Href: 'hidden' }],
        History: [{ Text: 'hidden' }],
      },
      {
        Id: 'closed-fly',
        CategoryId: 16144,
        Completed: true,
        CategoryName: 'Dumped or flytipped waste',
        DateTimeRecorded: '2026-10-02T10:00:00Z',
        Address: 'Closed Street',
        StatusName: 'Closed',
        Description: 'Not approved',
        Approved: false,
      },
      {
        Id: 'other-open',
        CategoryId: 17450,
        Completed: false,
        CategoryName: 'Pavement obstruction',
        DateTimeRecorded: '2026-10-02T10:00:00Z',
        Address: 'Other Street',
        StatusName: 'Open',
        Description: 'Other issue',
        Approved: true,
      },
      {
        Id: 'missing-completion',
        CategoryId: 16144,
        CategoryName: 'Dumped or flytipped waste',
        StatusName: 'Open',
      },
    ]);
  });
  app.post('/home/ssosignin', (_req, res) =>
    res.cookie('anonymous', 'mock').redirect(302, '/reports/add'),
  );
  app.get('/reports/add', (_req, res) =>
    res.send(
      '<form id="addReportForm" action="/reports/add"><input type="hidden" name="__RequestVerificationToken" value="mock-token"><input type="hidden" name="authorityName" value="256"></form>',
    ),
  );
  app.post('/reports/add', (req, res) => {
    if (String(req.body.CategoryId) !== '16144' || !req.body.Notes)
      return res.status(422).send('<p>Validation required</p>');
    if (req.body.Notes === 'outside')
      return res.send(
        '<p>The location of this report is not within the boundary of your local authority.</p>',
      );
    if (req.body.Notes === 'ambiguous') return res.send('<p>Request accepted</p>');
    return res.send('<p>Report submitted</p><span id="report-reference">MOCK-100</span>');
  });
  return app;
}
