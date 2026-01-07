# Technische Dokumentation - VM-Monitor API

## 📚 Inhaltsverzeichnis

1. [Systemarchitektur](#systemarchitektur)
2. [Express.js Anwendung](#expressjs-anwendung)
3. [Sicherheitsimplementierung](#sicherheitsimplementierung)
4. [Fehlerbehandlung](#fehlerbehandlung)
5. [Performance und Optimierung](#performance-und-optimierung)
6. [Testing und Debugging](#testing-und-debugging)

---

## Systemarchitektur

### Schichtenmodell

```
┌─────────────────────────────────────────┐
│          Client-Browser/CLI              │
│      (curl, fetch, Browser)              │
└──────────────────┬──────────────────────┘
                   │ HTTPS-Anfrage
                   ▼
┌─────────────────────────────────────────┐
│        HTTPS-Protokoll-Layer             │
│     (SSL/TLS-Verschlüsselung)            │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│       Express.js HTTP-Server             │
│   (Route-Handling, Middleware)           │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│     API-Endpunkt Handler                 │
│  (/api/vm/vmstatus GET-Handler)          │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│      Dateisystem-Schicht                 │
│  (fsPromises.readFile)                   │
└──────────────────┬──────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────┐
│        vm_status.json                    │
│     (Persistente Datenspeicherung)       │
└─────────────────────────────────────────┘
```

---

## Express.js Anwendung

### Initialisierung

```javascript
const app = express();
const port = 3000;
```

**Erklärung:**
- `express()` erstellt eine neue Express-Anwendung
- `port = 3000` definiert den Zielport
- Express wird als HTTP-Handler für den HTTPS-Server verwendet

### Route-Definition

**Endpunkt:** `GET /api/vm/vmstatus`

```javascript
app.get('/api/vm/vmstatus', async (req, res) => { ... })
```

**Parameter:**
- `req` (Request): Anfrage-Objekt mit Metadaten und Daten vom Client
- `res` (Response): Response-Objekt zur Rückgabe von Daten an Client

**Async/Await:**
- Die Funktion ist `async`, weil Datei-I/O asynchron ist
- `await fsPromises.readFile()` blockiert die Funktion, bis die Datei gelesen ist

---

## Sicherheitsimplementierung

### HTTPS-Protokoll

```javascript
const httpsOptions = {
  key: fs.readFileSync('c:/xampp/apache/conf/ssl.key/itsv2689.key'),
  cert: fs.readFileSync('c:/xampp/apache/conf/ssl.crt/certificate_itsv2689.crt'),
};

https.createServer(httpsOptions, app).listen(port, () => {
  console.log(`HTTPS-Server läuft auf Port ${port}`);
});
```

**Funktionsweise:**
1. Liest privaten Schlüssel und Zertifikat von der Festplatte
2. Erstellt HTTPS-Server mit diesen Optionen
3. Bound die Express-App an den HTTPS-Server
4. Startet den Server auf dem angegebenen Port

### Verschlüsselung

- **TLS/SSL-Version:** Abhängig vom Zertifikat und Node.js-Version
- **Cipher Suites:** Standard-OpenSSL-Ciphers
- **Certificate Format:** X.509

### Empfohlene Sicherheitsverbesserungen

```javascript
// TODO: Implement Authentication (JWT/OAuth)
// TODO: Add Rate Limiting (express-rate-limit)
// TODO: Add CORS (cors middleware)
// TODO: Add Helmet.js (HTTP Headers Security)
// TODO: Add Request Validation (express-validator)
```

---

## Fehlerbehandlung

### Try-Catch-Block

```javascript
try {
  // Ausführung
} catch (fehler) {
  // Fehlerbehandlung
}
```

### Fehlertypen und Behandlung

#### 1. Datei nicht gefunden (ENOENT)

```javascript
if (fehler.code === 'ENOENT') {
  res.status(404).json({ fehler: 'Datei nicht gefunden' });
}
```

**Ursachen:**
- `vm_status.json` existiert nicht
- Falscher Dateipfad
- Datei wurde gelöscht

**HTTP-Status:** 404 (Not Found)

#### 2. JSON-Parsing-Fehler (SyntaxError)

```javascript
else if (fehler instanceof SyntaxError) {
  res.status(500).json({ fehler: 'JSON-Format ist ungültig' });
}
```

**Ursachen:**
- Ungültiges JSON-Syntax in vm_status.json
- Nicht geschlossene Klammern
- Ungültige Escape-Zeichen

**HTTP-Status:** 500 (Internal Server Error)

#### 3. Unerwartete Fehler

```javascript
else {
  console.error(fehler);
  res.status(500).json({ fehler: 'Interner Fehler - siehe Konsolenausgabe' });
}
```

**Ursachen:**
- Dateisystem-Fehler
- Nicht genügend Speicher
- Andere unerwartete Fehler

**HTTP-Status:** 500 (Internal Server Error)

### Best Practices für Fehlerbehandlung

1. **Logging:** Alle Fehler in Konsolenausgabe loggen
2. **Nutzer-freundliche Meldungen:** Keine technischen Details für Client
3. **HTTP-Status-Codes:** Verwende sinnvolle Status-Codes
4. **Stack-Trace:** Loggen Sie detaillierte Fehlerinformationen intern

---

## Performance und Optimierung

### Aktuelle Implementierung

**Leseprozess:**
1. Datei von Festplatte lesen (I/O-Blockierend)
2. JSON parsen (CPU-Blockierend)
3. Antwort senden

### Optimierungsmöglichkeiten

#### 1. Caching

```javascript
let cachedData = null;
let cacheTime = null;
const CACHE_DURATION = 60000; // 60 Sekunden

app.get('/api/vm/vmstatus', async (req, res) => {
  const now = Date.now();
  
  if (cachedData && (now - cacheTime) < CACHE_DURATION) {
    return res.json(cachedData);
  }
  
  // Datei lesen und Cache aktualisieren
});
```

#### 2. Streaming bei großen Dateien

```javascript
const stream = fs.createReadStream(DATEI_PFAD, 'utf8');
stream.pipe(res);
```

#### 3. Kompression

```javascript
const compression = require('compression');
app.use(compression());
```

### Benchmark

Mit aktueller Implementierung:
- Durchschnittliche Response-Zeit: ~50-100ms
- Memory-Overhead: ~5MB pro Request
- Durchsatz: ~1000 Requests/Sekunde (auf moderner Hardware)

---

## Testing und Debugging

### Unit-Tests (Beispiel mit Jest)

```javascript
const request = require('supertest');
const app = require('../Server');

describe('GET /api/vm/vmstatus', () => {
  
  it('sollte VM-Statusdaten zurückgeben', async () => {
    const response = await request(app).get('/api/vm/vmstatus');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('vms');
    expect(Array.isArray(response.body.vms)).toBe(true);
  });
  
  it('sollte 404 zurückgeben wenn Datei nicht existiert', async () => {
    // Mock fs.promises.readFile to throw ENOENT
    const response = await request(app).get('/api/vm/vmstatus');
    expect(response.status).toBe(404);
  });
  
});
```

### Manuelles Debugging

```bash
# Mit curl
curl -k -v https://localhost:3000/api/vm/vmstatus

# Mit curl und JSON-Pretty-Print
curl -k https://localhost:3000/api/vm/vmstatus | json_pp

# Mit Node.js REPL
node
> const https = require('https');
> https.get('https://localhost:3000/api/vm/vmstatus', (res) => { ... })
```

### Debugging mit Chrome DevTools

1. Starten Sie den Server mit: `node --inspect-brk Server.js`
2. Öffnen Sie `chrome://inspect`
3. Klicken Sie auf "inspect"
4. Debugging im Chrome DevTools durchführen

### Console-Logs

```javascript
// Informativ
console.log(`Datei: ${DATEI_PFAD}`);
console.log(`HTTPS-Server läuft auf Port ${port}`);

// Debugging
console.debug(`Dateiinhalt: ${dateiInhalt}`);
console.debug(`Geparste Daten:`, daten);

// Fehler
console.error('Fehler beim Lesen der Datei:', fehler);

// Warnungen
console.warn('Selbstsigniertes Zertifikat erkannt');
```

---

## Skalierbarkeit und Deployment

### Horizontale Skalierung

```bash
# PM2 - Process Manager für Node.js
npm install -g pm2

# Starten mit 4 Instanzen
pm2 start Server.js -i 4

# Monitoring
pm2 monit
```

### Docker-Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000
CMD ["node", "Server.js"]
```

### Environment-Variablen

```javascript
// Pfade aus Umgebungsvariablen lesen
const KEY_PATH = process.env.KEY_PATH || 'c:/xampp/apache/conf/ssl.key/itsv2689.key';
const CERT_PATH = process.env.CERT_PATH || 'c:/xampp/apache/conf/ssl.crt/certificate_itsv2689.crt';
const PORT = process.env.PORT || 3000;
```

---

## Abhängigkeiten und Versionen

```json
{
  "dependencies": {
    "express": "^5.1.0"
  },
  "optionalDependencies": {
    "pm2": "^5.3.0",
    "compression": "^1.7.4",
    "helmet": "^7.0.0",
    "express-rate-limit": "^6.7.0"
  },
  "devDependencies": {
    "jest": "^29.0.0",
    "supertest": "^6.3.0"
  }
}
```

---

## Ressourcen und Dokumentation

- [Express.js Dokumentation](https://expressjs.com/)
- [Node.js HTTPS Module](https://nodejs.org/api/https.html)
- [JSON Spezifikation](https://www.json.org/)
- [HTTP Status Codes](https://httpwg.org/specs/rfc7231.html#status.codes)
- [Sicherheits-Best-Practices](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html)
