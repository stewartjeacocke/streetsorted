---
layout: default
title: Report fly-tipping
permalink: /report/
---

# Report fly-tipping

<p id="status-message" class="status" role="status" aria-live="polite"></p>

<section id="location-step" aria-labelledby="location-heading">
  <h2 id="location-heading">Location required</h2>
  <p>Allow browser location access to continue. The detected location cannot be edited.</p>
  <button id="request-location" type="button">Use my location</button>
  <button id="retry-location" type="button" hidden>Retry location</button>
</section>

<section id="details-step" hidden aria-labelledby="details-heading">
  <h2 id="details-heading">Tell us about the fly-tipping</h2>
  <p><strong>Category:</strong> Fly-tipping</p>
  <label for="description">Description</label>
  <textarea id="description" name="description" maxlength="1000" required></textarea>
  <p id="description-error" class="error" role="alert"></p>
  <button id="review-report" type="button">Review report</button>
  <button class="cancel-report" type="button">Cancel</button>
</section>

<section id="review-step" hidden aria-labelledby="review-heading">
  <h2 id="review-heading">Review report</h2>
  <dl>
    <dt>Category</dt><dd>Fly-tipping</dd>
    <dt>Location</dt><dd id="review-location"></dd>
    <dt>Description</dt><dd id="review-description"></dd>
  </dl>
  <button id="confirm-report" type="button">Confirm and submit report</button>
  <button id="edit-report" type="button">Edit description</button>
  <button class="cancel-report" type="button">Cancel</button>
</section>

<section id="outcome-step" hidden aria-labelledby="outcome-heading">
  <h2 id="outcome-heading">Submission outcome</h2>
  <p id="outcome-message" role="status" aria-live="polite"></p>
  <p id="outcome-reference"></p>
  <button id="retry-submission" type="button" hidden>Try submission again</button>
  <a href="{{ '/' | relative_url }}">Start a new report</a>
</section>

<script type="module" src="{{ '/assets/js/report-flow.js' | relative_url }}"></script>
