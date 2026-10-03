import express from 'express';

export function createMockTarget() {
  const app = express();
  app.use(express.urlencoded({ extended: false }));
  app.post('/home/ssosignin', (_req, res) =>
    res.cookie('anonymous', 'mock').redirect(302, '/reports/add'),
  );
  app.get('/reports/add', (_req, res) =>
    res.send(
      '<form id="addReportForm" action="/reports/add"><input type="hidden" name="__RequestVerificationToken" value="mock-token"><input type="hidden" name="authorityName" value="256"></form>',
    ),
  );
  app.post('/reports/add', (req, res) => {
    if (String(req.body.CategoryId) !== '16144' || !req.body.Notes) {
      return res.status(422).send('<p>Validation required</p>');
    }
    if (req.body.Notes === 'outside') {
      return res.send(
        '<p>The location of this report is not within the boundary of your local authority.</p>',
      );
    }
    if (req.body.Notes === 'ambiguous') return res.send('<p>Request accepted</p>');
    return res.send('<p>Report submitted</p><span id="report-reference">MOCK-100</span>');
  });
  return app;
}
