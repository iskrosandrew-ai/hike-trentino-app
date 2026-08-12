# Hike Trentino

A web app that helps you discover and plan hiking trails in Trentino (Italy).  
It combines a curated list of trails with weather forecasts and smart recommendations so you can pick the best hike for a given day.

**Live demo**: [https://hike-trentino-app-andy.vercel.app/]  
**Source of trail data**: [Visit Trentino – Trekking](https://www.visittrentino.info/it/guida/attivita-outdoor/trekking)

---

## What it does

- Browse hiking trails in Trentino (area, difficulty, distance, elevation gain).
- Enter a departure place (with autocomplete) and a date.
- Get weather forecasts (Open-Meteo, up to 10 days) for both the departure point and each trail.
- Filter by difficulty, distance from departure, elevation, length, etc.
- Receive ranked recommendations that combine:
  - Weather suitability
  - Driving distance
  - Elevation / difficulty preferences
- Save favorites and track completed hikes (with a simple profile/stats page).
- Multi-language interface: English, Italian, German.

The app is designed as a practical planning tool for day hikes in the Trentino region.

---

## Tech stack

- **Frontend**: Vite + vanilla JavaScript (modular structure)
- **Data**: Trails stored in Supabase
- **Weather & geocoding**: Open-Meteo
- **Hosting**: Vercel (automatic deploys from GitHub)
- **Auth / user features**: Supabase Auth (for favorites, completed trails, profile)

Completely free stack.

---

## Features overview

- Trail list with filters (difficulty, min/max elevation, max distance, etc.)
- Departure place autocomplete + driving-distance calculation
- Weather bar for departure location + per-trail weather on cards
- Combined recommendation score + “Recommended” badge on top results
- Reason text explaining why a trail is suggested
- Pagination, clear/reset filters, Search-driven flow
- Favorites + Completed trails + basic profile statistics
- EN / IT / DE language switcher
- Favicon + Open Graph image for sharing

---

## Local development

```bash
git clone https://github.com/iskrosandrew-ai/hike-trentino-app.git
cd hike-trentino-app
npm install
npm run dev