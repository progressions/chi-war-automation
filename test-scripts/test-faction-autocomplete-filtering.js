#!/usr/bin/env node

// Lightweight Node smoke-test for faction autocomplete filtering.
// Mirrors the manual curl snippet from test-requests/Factions.md.

import fetch from 'node-fetch';
import process from 'node:process';

async function main() {
  const baseUrl = process.env.API_BASE_URL || 'http://localhost:4002';
  const token = process.env.API_TOKEN;

  if (!token) {
    console.error('API_TOKEN env var is required.');
    process.exit(1);
  }

  const params = new URLSearchParams({
    search: 'Shadow',
    page: '1',
    per_page: '5',
  });

  const url = `${baseUrl}/api/v2/factions/autocomplete?${params.toString()}`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    console.error('Request failed:', response.status, await response.text());
    process.exit(2);
  }

  const body = await response.json();
  const names = body.factions?.map((f) => f.name) || [];

  console.log('Autocomplete results:', names.join(', '));
}

main().catch((err) => {
  console.error(err);
  process.exit(99);
});
