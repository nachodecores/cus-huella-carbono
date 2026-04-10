# Project Overview

## Project
Web application for seed companies to complete a simple form and obtain a preliminary estimate of the carbon footprint of seed production.

## Initial objective
Build a very simple MVP focused on data collection and preliminary calculation.

## Main users
- External company users
- Internal admin users

## External user access
- No traditional login
- Each company accesses through a unique token link

## Unit of analysis
Company + crop + season

## Season structure
- season_type: primavera | otoño
- season_year: numeric year

## Main business rules
- A company can load multiple crop-season entries
- External users can save draft and submit
- After submission, external users cannot edit
- Any correction after submission must be handled by admin

## Product scope for v1
- Simple external flow
- Minimal database
- Preliminary carbon footprint calculation
- Basic admin panel later

## Product scope not required yet
- Certification workflow
- Advanced permissions
- RLS
- Complex audit/versioning