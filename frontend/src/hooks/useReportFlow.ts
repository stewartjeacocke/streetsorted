import { useState } from 'react';
import { locate, fresh } from '../lib/location';
import { nearby, submit, type Location, type Nearby } from '../api/report-api';
type Step = 'location' | 'nearby' | 'details' | 'review' | 'outcome';
export function useReportFlow() {
  const [step, setStep] = useState<Step>('location');
  const [location, setLocation] = useState<Location | null>(null);
  const [reports, setReports] = useState<Nearby[]>([]);
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [outcome, setOutcome] = useState<{
    message: string;
    reference?: string | null;
    retry?: boolean;
  }>({ message: '' });
  const reset = () => {
    setStep('location');
    setLocation(null);
    setReports([]);
    setDescription('');
    setMessage('');
    setOutcome({ message: '' });
  };
  const lookup = async (l: Location) => {
    setStep('nearby');
    setMessage('Checking nearby reports…');
    const r = await nearby(l);
    if (r.state === 'reports-found') {
      setReports(r.reports);
      setMessage('');
    } else if (r.state === 'no-results') {
      setReports([]);
      setMessage('No nearby reports were found.');
    } else {
      setReports([]);
      setMessage(r.residentMessage || 'Nearby reports could not be retrieved. Please try again.');
    }
  };
  const getLocation = async () => {
    try {
      const l = await locate();
      setLocation(l);
      await lookup(l);
    } catch {
      setMessage('Location access is required. Please retry location detection.');
      setStep('location');
    }
  };
  const applyManualLocation = async (latitude: number, longitude: number) => {
    const l: Location = { latitude, longitude, capturedAt: new Date().toISOString() };
    setLocation(l);
    await lookup(l);
  };
  const continueDetails = () => {
    setStep('details');
    setMessage('');
  };
  const match = () => {
    reset();
    setOutcome({
      message:
        'You indicated that a nearby report already matches this issue. No new report was submitted.',
    });
    setStep('outcome');
  };
  const review = async () => {
    if (!fresh(location)) {
      if (location) await getLocation();
      return;
    }
    if (!description.trim()) {
      setMessage('Enter a description.');
      return;
    }
    setStep('review');
    setMessage('');
  };
  const confirm = async () => {
    if (!location || !fresh(location)) {
      await getLocation();
      return;
    }
    setMessage('Submitting report…');
    const r = await submit({ category: 'fly-tipping', location, description, confirmed: true });
    setOutcome({ message: r.residentMessage, reference: r.reference, retry: r.retryAllowed });
    setMessage('');
    setStep('outcome');
  };
  return {
    step,
    location,
    reports,
    description,
    setDescription,
    message,
    outcome,
    reset,
    getLocation,
    applyManualLocation,
    lookup,
    continueDetails,
    match,
    review,
    confirm,
    setStep,
  };
}
