# Fuel Finder

A Django REST Framework backend and React + Vite + TypeScript frontend application to find fuel stations (petrol, diesel, CNG) along routes or in a specific city.

## Setup Instructions

### Backend
1. `cd backend`
2. Create virtual environment: `python -m venv venv`
3. Activate virtual environment: `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Mac/Linux)
4. Install dependencies: `pip install -r requirements.txt` (if exists, or install django, djangorestframework, requests, polyline, django-cors-headers)
5. Copy `.env.example` to `.env` and set `GEOAPIFY_API_KEY`.
6. Apply migrations: `python manage.py migrate`
7. Seed initial data and create admin user: `python seed.py`
    - **Admin Credentials**: Username `admin`, Password `admin`
8. Start the server: `python manage.py runserver`

### Frontend
1. `cd frontend`
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and set `VITE_GEOAPIFY_API_KEY`.
4. Start the dev server: `npm run dev`

## Admin Panel
Access the custom admin panel at `http://localhost:5173/admin/login`. Log in with your admin credentials to:
- Add, edit, or delete fuel stations manually.
- Set accurate coordinates via a Leaflet map.
- Add fuel prices for stations.
- Import stations dynamically from Geoapify for a given city and merge them with your manual edits.

## Management Commands
You can automate fetching stations using the built-in Django command:
```bash
python manage.py sync_stations --city "Ahmedabad"
```
This command syncs stations from Geoapify into the database, keeping manual edits intact.

## New API Endpoints
- `POST /api/auth/login/`: Admin login to receive an auth token.
- `GET/POST/PATCH/DELETE /api/stations/`: Full CRUD operations for admin stations.
- `GET/PATCH/DELETE /api/stations/prices/`: Manage fuel prices.
- `POST /api/stations/import-geoapify/`: Imports stations into the DB from Geoapify for a specific city. 
- `POST /api/routing/route-stations/`: Returns a merged list of stations (Geoapify + DB) near a route.
- `GET /api/routing/city-stations/`: Returns a merged list of stations within a city.
