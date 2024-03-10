# Lobo <-> Bexio Invoice Sync

- Loads invoices from Lobo
  - Set the timerange using env variable `NUM_MONTHS_TO_SYNC`
- For each invoice from Lobo
  - Upsert a Bexio contact for the Lobo invoice customer
    - Uses the bexio `contact.fax` field for matching
  - Search for a corresponding bexio invoice
    - If found, cancel it if necessary
    - If found and the bexio invoice is marked paid, set the payment date on the lobo invoice
    - If not found, create a bexio invoice

## Features

- Bexio contacts for Lobo invoice customers
- Bexio invoices for Lobo invoices
  - Differentiate between revenue and expenses
- Set Lobo invoice payment date for paid Bexio invoices

## Configuration

Use Environment variables.

See `.env.example`

## Timings

In order to keep within rate limits

### Mostly No-Ops

For months which have previously been synced, only changes to payment dates and invoice cancellations:

20 - 25 seconds / 100 invoices

### First Time Syncs

For months which have never been synced, creating all invoices and a few of contacts

About 130 seconds / 100 invoices
