## Problem

A bank wanted customers to apply for vehicle financing inside its mobile app, with multifinance partners doing the lending. The rules came from several places: business teams defined what could be financed, risk and legal set the conditions, and each partner had its own process. Customers were also dropping out of the application where they had to retype data the bank already held.

## What I did

I was the product owner. I translated the conditions set by business, risk and legal into process flows, user stories, acceptance criteria and testable workflows, and I worked through them with engineering and the partners.

I analysed where applicants dropped off and recommended pre-filling the fields the bank already held. The recommendation went through prioritisation and into the build.

I co-owned business user acceptance testing, and I built a release readiness checklist so that nothing reached production without a named check.

## How it works

The journey has five stages: application, affordability check, partner offer, agreement and disbursement. Each stage has a status the customer can see, and each hand-off to a partner has a defined payload and a defined answer.

## Evidence

- Discovery to launch in about three months.
- More than 500 acceptance test cases across lending and donation products.
- The release readiness checklist was adopted by three further digital initiatives.
- The pre-filling recommendation was built and released.

## Limits and next steps

I did not set credit criteria and I did not design the lending rules; those belonged to the business, risk and legal teams. My work was to make their conditions precise enough to build and to test. The commercial result was shared work across those teams, the partners and engineering.

The calculation logic behind a product like this is something I later rebuilt generically in the Vehicle Finance Engine.
