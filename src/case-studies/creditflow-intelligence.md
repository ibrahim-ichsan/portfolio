## Problem

A lender has to decide who gets credit, at what expected loss, before the customer leaves the checkout. I wanted to build that decision end to end on public data, so that every step can be read, run and challenged.

## What I built

A Python project on the Home Credit Default Risk dataset. The first module covers credit decisioning: exploratory analysis, feature construction, a baseline logistic regression and the metrics to judge it. A calibration module adds a reliability table and the Brier skill score, because a ranking model that is badly calibrated still prices risk wrongly. A loan mathematics library handles annuity instalments and amortisation schedules.

I write the logic myself. AI is used as a reviewer, not as the author.

## How it works

Three notebooks carry the analysis in order: data exploration, features, model. The reusable logic sits in `src/credit` (features, model, metrics, calibration) and `src/loan_math.py`. Raw data stays outside the repository, because the competition rules restrict redistribution.

## Evidence

- Ten test files cover features, metrics, model, calibration and loan mathematics, run with pytest.
- Library versions are pinned in `requirements.txt`, so the environment can be rebuilt.
- The commit history shows the order of work, one module at a time.

## Limits and next steps

This is the first of five planned modules. Expected loss with Monte Carlo simulation, tranching, a corporate credit view and a checkout flow are not built yet. The baseline model is deliberately simple; it exists to set a reference before anything more complex is tried.
