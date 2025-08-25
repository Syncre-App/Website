```markdown
# API dokumentáció (rövid)

Ez a fájl röviden összefoglalja az `app/api` alatt található végpontokat: útvonal, HTTP metódus, szükséges hitelesítés, bemenetek és viselkedés.

Checklist:
- Minden endpoint rövid leírása
- Auth követelmények feljegyezve
- DB / env megjegyzések

## Általános megjegyzések
- Hitelesítés: a legtöbb végpont JWT-alapú; küldd a fejlécben `Authorization: Bearer <token>` formában. A token a projektben `jwt.sign({ token: "<hash>:<salt>" }, JWT_SECRET)` alakban készül.
- Várható adatbázis táblamezők (legalább a kódhoz): `id, salt, hash, email, profile_picture, username, friends, pending_friends, notify, created_at, accessToken`.
- Környezeti változók, amiket a kód használ: `DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, NEXT_PUBLIC_CLIENT_ID, CLIENT_SECRET, NEXT_PUBLIC_REDIRECT_URI, JWT_SECRET`.

---

## GET /api
- Leírás: Egyszerű health-check.
- Auth: nem szükséges
- Válasz: 200 JSON: `{ message: 'API is working fine' }`

## GET /api/callback
- Leírás: OAuth2 callback a Discord bejelentkezéshez.
- Query paramok: `code` (kötelező) — az OAuth visszaadott kód.
- Auth: nem szükséges (OAuth callback)
- Viselkedés:
	- Kicseréli a kódot access tokenre a Discord OAuth endpointon.
	- Lekéri a Discord user adatokat `/users/@me`-ről.
	- Ellenőrzi, hogy van-e már user az adatbázisban `id` vagy `email` alapján.
	- Megújítja az `accessToken`-t létező usernél.
	- Új user esetén beszúrja az adatbázisba (a kód `safeInsert` logikát használ a hiányzó oszlopok kezelése miatt).
	- JWT-t készít (`token = jwt.sign({ token: '<hash>:<salt>' }, JWT_SECRET, { expiresIn: '2d' })`) és redirectet küld: `/login?token=<token>`.
	- Hibák esetén JSON hibaválaszt ad (500/400), vagy redirectel egy `/error` oldalra ha nincs `code`.

## POST /api/notifications/[id]/[action]
- Útvonal paraméterek: `id` (notification id), `action` (accept|reject|dismiss)
- Auth: szükséges (`Authorization: Bearer <token>`)
- Leírás: Feldolgoz egy értesítést — főleg barátkérés értesítéseknél használatos.
- Viselkedés:
	- Ellenőrzi a tokenből a felhasználót (hash:salt).
	- Kikeresi a felhasználó értesítései közül a `id`-hoz tartozót.
	- Ha `type === 'friend_request'` és `action === 'accept'` akkor:
		- eltávolítja a pending requestet, frissíti mindkét user `friends` mezőjét, küld egy értesítést a feladónak, és létrehoz egy új chatet ha szükséges.
	- Ha `reject`, akkor a pending requestet eltávolítja és frissíti a feladót.
	- `dismiss` eltávolítja csak az értesítést.
	- Visszatérési érték: státusz 200 és JSON üzenet.

## GET /api/users?id=<targetUserId>
- Leírás: Célzott felhasználó adata (közös ismerősökkel).
- Query paramok: `id` (cél user id) — kötelező
- Auth: szükséges (`Authorization: Bearer <token>`)
- Válasz: `{ username, profile_picture, common_friends }` (közös barátok listája)

## GET /api/users/me
- Leírás: A jelenleg bejelentkezett user adatai.
- Auth: szükséges
- Válasz: `{ user: { id, username, email, profile_picture, friends, notify, created_at, ... }, notifications }`

## GET /api/users/me/friends
- Leírás: A jelenlegi user barátainak részletes listája.
- Auth: szükséges
- Válasz: `{ friends: [ { id, username, email, profile_picture }, ... ] }`

## POST /api/users/me/friends
- Leírás: Barátkérés küldése.
- Auth: szükséges
- Body (JSON): `{ "to_id": <targetUserId> }` (kötelező)
- Viselkedés:
	- Ellenőrzi, hogy nincs-e már függő kérés.
	- Hozzáadja a `pending_friends`-be mindkét felhasználónál, és értesítést helyez a címzett `notify` mezőjébe.
	- Tranzakciót használ a művelethez; ütközések esetén visszagörget.

## GET /api/users/me/notify
- Leírás: A jelenlegi user értesítéseinek listázása.
- Auth: szükséges
- Válasz: `{ notifications: [...] }`

## POST /api/users/me/notify
- Leírás: Értesítések frissítése (jelölés olvasottnak, törlés stb.).
- Auth: szükséges
- Body (JSON): `{ action: 'mark_read'|'mark_all_read'|'delete', notificationId?: string }`
- Viselkedés: Frissíti a `notify` mezőt a felhasználónál és visszaadja a frissített értesítéseket.

---

## Hibák és DB séma megjegyzések
- Ha a táblád eltér a projektben használt sémától, előfordulhat `ER_BAD_FIELD_ERROR` (ismeretlen oszlop) vagy `ER_NO_DEFAULT_FOR_FIELD` hibák. A repó kódja próbálja kezelni az ismeretlen oszlopokat (`safeInsert`), de nem pótolja a NOT NULL mezőket — ezeket vagy a kódnak kell feltölteni, vagy az adatbázist kell módosítani.
- Gyakori javítások (példák):
	- `ALTER TABLE users ADD COLUMN dc_id VARCHAR(20) NULL;`
	- `ALTER TABLE users ADD COLUMN friends LONGTEXT NULL, ADD COLUMN pending_friends LONGTEXT NOT NULL DEFAULT '[]', ADD COLUMN notify LONGTEXT NULL;`

## Kiegészítő megjegyzés
- Ha később automatikus guild-join funkciót szeretnél (bot hozzáadása a szerverre), szükséges lesz `DISCORD_BOT_TOKEN` és `DISCORD_GUILD_ID` env változókra, és a botnak megfelelő jogosultságokra a szerveren.

Ha szeretnéd, beleteszem a README-be a pontos request/response példákat minden végponthoz — szólj, melyik végpontnál kéred a példát.
```
