# Brownotate App

## Overview

Brownotate App is the React web interface for the Brownotate backend.

You can try the hosted demo at https://lsmbo-brownotate.u-strasbg.fr.
Guest users can run database searches only; annotation jobs are disabled for guests because they use institute compute resources.
To get annotation access, contact fbertile@unistra.fr to request an account. Otherwise install your own instance using the instructions below.

## Prerequisites

- **Node.js and npm**
- **A static web server** such as Apache, nginx, or any other static file host
- A running Brownotate backend reachable from the frontend
- `src/config.js` configured with the backend API URL

## Deployment Instructions

1. Clone the React project repository:

```bash
git clone https://github.com/LSMBO/brownotate-app.git
cd brownotate-app
```

2. Install project dependencies:

```bash
npm install
```

3. Configure the API base URL in `src/config.js`.

Example for the hosted demo:

```js
module.exports = {
  API_BASE_URL: 'https://lsmbo-brownotate.u-strasbg.fr/api'
}
```

If you self-host the client and proxy `/api` to the backend, you can use:

```js
module.exports = {
  API_BASE_URL: '/api'
}
```

4. Build the app:

```bash
npm run build
```

5. Serve the `build/` directory with a static web server.

If you use Apache or nginx, configure it to serve static files and forward `/api` requests to the Brownotate backend.

## Notes

- The frontend is a static React app. It does not require Apache specifically; any static file host works.
- The app communicates with the backend using `API_BASE_URL` in `src/config.js`.
- The hosted demo already points to the Brownotate service at https://lsmbo-brownotate.u-strasbg.fr.

#### Login
Use your email and password to sign in. The Create an account section requires a server access code, which only the server owner should share. Guest users can still use search features without an account.

#### Home
Search for species and view available datasets. This page is mainly for database search and selection of inputs for later analysis.

#### Settings
Configure and launch annotation runs. Choose your input data and pipeline options, then start the job.

#### Protein Name Assignment (Brownaming)
Run Brownaming independently with a FASTA file and species information.

#### My Annotations
Monitor runs, see their status, and open results. This page shows current and past jobs for review.

#### About
Use the About button for the full interface documentation. It explains each page and all workflow details in one place.
