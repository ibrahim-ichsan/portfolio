## Problem

Vehicle loan calculators often live in one large spreadsheet. The rules for pricing, insurance and affordability are spread across cells, which makes them hard to test and easy to break.

## What I built

A generic vehicle finance engine in Python, written from scratch as separate modules: pricing, insurance, customer tiers and affordability. Every parameter comes from a configuration object. The repository ships a synthetic example configuration only; no real lender parameters are published.

## How it works

`pricing.py` computes the financed amount and instalment. `insurance.py` builds the premium for a coverage combination across the loan tenor. `tiers.py` assigns the rate tier. `affordability.py` compares the instalment and other debts against income. `example_config.py` holds the synthetic numbers that drive the tests.

## Evidence

- Each module has its own test file, plus a test that checks the example configuration is internally consistent.
- Rebuilding the logic rule by rule and reconciling it against a source spreadsheet surfaced about ten inconsistencies in that spreadsheet.

## Limits and next steps

The engine covers one product shape. It does not model early settlement, fees that vary by partner, or regulatory caps by market. Those are the next rules to add as configuration, with tests first.
