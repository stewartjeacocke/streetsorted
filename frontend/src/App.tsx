import { LocationStep } from './components/LocationStep';
import { NearbyReportsStep } from './components/NearbyReportsStep';
import { ReportDetailsStep } from './components/ReportDetailsStep';
import { ReviewStep } from './components/ReviewStep';
import { OutcomeStep } from './components/OutcomeStep';
import { useReportFlow } from './hooks/useReportFlow';
export default function App() {
  const f = useReportFlow();
  if (f.step === 'location') return <LocationStep message={f.message} onLocate={f.getLocation} />;
  if (f.step === 'nearby')
    return (
      <NearbyReportsStep
        location={f.location}
        reports={f.reports}
        message={f.message}
        onMatch={f.match}
        onNoMatch={f.continueDetails}
        onRetry={() => f.location && f.lookup(f.location)}
        onApply={f.applyManualLocation}
        onCancel={f.reset}
      />
    );
  if (f.step === 'details')
    return (
      <ReportDetailsStep
        value={f.description}
        message={f.message}
        onChange={f.setDescription}
        onReview={f.review}
        onCancel={f.reset}
      />
    );
  if (f.step === 'review' && f.location)
    return (
      <ReviewStep
        location={f.location}
        description={f.description}
        onConfirm={f.confirm}
        onEdit={() => f.setStep('details')}
        onCancel={f.reset}
      />
    );
  return (
    <OutcomeStep
      message={f.outcome.message}
      reference={f.outcome.reference}
      retry={f.outcome.retry}
      onReset={f.reset}
      onRetry={f.confirm}
    />
  );
}
