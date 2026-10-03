import type { AppConfig } from '../config.js';
import type { ReportDraft, SubmissionOutcome } from '../domain/report.js';
import { submitToLoveCleanStreets } from '../adapters/love-clean-streets/submission.js';

export class ReportSubmissionService {
  constructor(private readonly config: AppConfig) {}
  async submit(draft: ReportDraft): Promise<SubmissionOutcome> {
    return submitToLoveCleanStreets(draft, this.config);
  }
}
