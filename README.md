# Wealth
Software Methodology

## Frontend API Configuration

This app uses `VITE_API_BASE_URL` for backend requests.

- Local development default: `/api` (works with Vite proxy to `http://localhost:3100`)
- GitHub Pages: set repository variable `VITE_API_BASE_URL` to your deployed backend URL, for example:
	`https://your-backend.example.com/api`

Optional local override:

1. Create `.env.local`
2. Add:

```env
VITE_API_BASE_URL=http://localhost:3100/api
```
