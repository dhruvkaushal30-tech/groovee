# Groove

Light-theme streetwear store with customer and admin accounts.

## Stack

React, plain CSS, Node.js, Express, MongoDB.

## Run

Compass is the viewer. This project stores data in a local database named `veld`.

If nothing is listening on port 27017, start the bundled local server and leave that terminal open:

```bash
cd backend
npm run db
```

In Compass, add the connection `mongodb://127.0.0.1:27017` and open the `veld` database.

```bash
cd backend
copy .env.example .env
npm install
npm run seed
npm run dev
```

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

Admin login (created by the seed script):

- Email: `admin@veld.store`
- Password: `Admin@12345`

Customer registration is on `/register`. Admin tools are at `/admin/login`.

Cash on delivery is the only payment method. Shipping is free at ₹1,999 and above, otherwise ₹79. The sample coupon is `VELD10` (10% off, minimum ₹999).
