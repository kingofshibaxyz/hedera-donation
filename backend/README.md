# Hedera Donation Platform - Backend

## Project Overview

Django-powered backend for the Hedera Donation platform, providing robust API services, campaign management, and blockchain interaction.

## System Requirements

- Python 3.9+
- PostgreSQL 12+
- Docker (optional, but recommended)

## Setup and Installation

### Local Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/duysy/hedera-donation.git
   cd backend/hedera_donation
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Database Setup:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

4. Create Superuser:
   ```bash
   python manage.py createsuperuser
   ```

5. Go to localhost:8000:
   ```bash
   python manage.py runserver
   ```
