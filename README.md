# VM-Monitor System

## 📋 Übersicht

Das VM-Monitor System ist eine HTTPS-basierte API-Lösung zur Überwachung und Verwaltung virtueller Maschinen. Es bietet einen sicheren REST-API-Endpunkt, über den die Statusinformationen aller verwalteten VMs abgefragt werden können.

**Version:** 1.0.0  
**Autor:** Paul Buchwald  
**Lizenz:** ISC

---

## 🏗️ Projektstruktur

```
VM_Monitor/
├── api/
│   ├── Server.js                    # HTTPS-API-Server (Hauptanwendung)
│   ├── package.json                 # NPM-Abhängigkeiten und Konfiguration
│   └── certs/
│       └── SSL.p7b                  # SSL/TLS-Zertifikat
├── vm_status.json                   # VM-Statusdatendatei
├── vm_monitor.bat                   # Windows-Startskript
├── API_Server.bat                   # API-Server-Startskript
├── Checking/                        # Überprüfungs-/Test-Verzeichnis
└── README.md                        # Diese Datei
```

---

## 🚀 Installation und Setup

### Systemanforderungen
- **Node.js** v14.0 oder höher
- **npm** (Node Package Manager)
- **HTTPS-Zertifikat** und Schlüssel
- **Windows** oder **Linux/macOS** mit Bash-Support

### Installationsschritte

1. **Abhängigkeiten installieren:**
   ```bash
   cd api
   npm install
   ```

2. **SSL/TLS-Zertifikat konfigurieren:**
   - Platzieren Sie Ihren privaten Schlüssel
   - Platzieren Sie Ihr Zertifikat
   - **Hinweis:** Die Pfade sind derzeit hardcodiert und sollten bei Bedarf angepasst werden

3. **Server starten:**
   ```bash
   npm start
   ```
   oder
   ```bash
   node Server.js
   ```

---

## 📡 API-Dokumentation

### Endpunkt: VM-Status abrufen

**Anfrage:**
```
GET https://localhost:3000/api/vm/vmstatus
```

**Authentifizierung:**
- Keine (aktuell). In einer Produktionsumgebung sollten Sie Authentifizierung implementieren.

**Rückgabe (Erfolg - HTTP 200):**
```json
{
  "vms": [
    {
      "name": "PVM01",
      "online": true,
      "users": 1,
      "beschreibung": "Produktionsmaschine 01"
    },
    {
      "name": "PVM02",
      "online": true,
      "users": 1,
      "beschreibung": "Produktionsmaschine 02"
    }
  ]
}
```

**Mögliche Statuscodes:**

| Code | Beschreibung | Beispiel-Antwort |
|------|--------------|------------------|
| 200 | OK - Daten erfolgreich abgerufen | `{ "vms": [...] }` |
| 404 | Datei nicht gefunden | `{ "fehler": "Datei nicht gefunden" }` |
| 500 | Interner Fehler | `{ "fehler": "Interner Fehler - siehe Konsolenausgabe" }` |

---

## 📊 Datenformat der vm_status.json

Die `vm_status.json`-Datei enthält die Konfiguration aller verwalteten virtuellen Maschinen:

```json
{
  "vms": [
    {
      "name": "PVM01",           // Name der VM
      "online": true,            // Status (true = online, false = offline)
      "users": 1,                // Anzahl aktiver Benutzer
      "beschreibung": "..."      // Optionale Beschreibung
    }
  ]
}
```

**Eigenschaften:**
- `name` (String): Der eindeutige Name der virtuellen Maschine
- `online` (Boolean): Aktueller Betriebsstatus
- `users` (Number): Anzahl der aktuell angemeldeten Benutzer
- `beschreibung` (String, optional): Kurzbeschreibung der VM

---

## 🔒 Sicherheitshinweise

### Aktuelle Implementierung
- ✅ HTTPS-Verschlüsselung
- ✅ SSL/TLS-Zertifikat

### Verbesserungen für Produktionsumgebung
- ⚠️ **Authentifizierung:** Implementieren Sie JWT oder API-Keys
- ⚠️ **Autorisierung:** Setzen Sie rollenbasierte Zugriffskontrolle (RBAC) um
- ⚠️ **Input-Validierung:** Validieren Sie alle Eingaben
- ⚠️ **Logging:** Implementieren Sie detailliertes Logging und Monitoring
- ⚠️ **CORS:** Konfigurieren Sie Cross-Origin Resource Sharing bei Bedarf
- ⚠️ **Rate-Limiting:** Schützen Sie die API vor Brute-Force-Angriffen

---

## 📝 Verwendungsbeispiele

### Mit curl
```bash
# Unsicheres Zertifikat akzeptieren (nur zu Testzwecken!)
curl -k https://localhost:3000/api/vm/vmstatus
```

### Mit Node.js/Fetch
```javascript
fetch('https://localhost:3000/api/vm/vmstatus', {
  method: 'GET',
  // Bei selbstsigniertem Zertifikat:
  // rejectUnauthorized: false
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Fehler:', error));
```

### Mit JavaScript (Browser)
```javascript
// Hinweis: Mixed Content-Warnung bei HTTP-Seite + HTTPS-API
fetch('https://localhost:3000/api/vm/vmstatus')
  .then(res => res.json())
  .then(data => {
    data.vms.forEach(vm => {
      console.log(`${vm.name}: ${vm.online ? 'Online' : 'Offline'} (${vm.users} Benutzer)`);
    });
  });
```

---

## 🛠️ Entwicklung und Wartung

### Code-Struktur

**Server.js Komponenten:**
1. **Module-Imports:** Express, Dateisystem, HTTPS
2. **Konfiguration:** HTTPS-Optionen, Port-Einstellung
3. **Hauptendpunkt:** `/api/vm/vmstatus` GET-Handler
4. **Fehlerbehandlung:** Kategorisierte Fehlerbearbeitung
5. **Server-Start:** HTTPS-Server initialisieren

### Häufige Probleme und Lösungen

| Problem | Ursache | Lösung |
|---------|--------|--------|
| ENOENT: vm_status.json nicht gefunden | Datei existiert nicht | Stelle sicher, dass `vm_status.json` im Root-Verzeichnis existiert |
| JSON FORMAT ist ungültig | Ungültiges JSON in vm_status.json | Validiere die JSON-Syntax mit einem JSON-Validator |
| Zertifikat nicht gefunden | Falscher Pfad oder fehlende Datei | Überprüfe die Zertifikatspfade in Server.js |
| HTTPS_ERROR beim Zugriff | Selbstsigniertes Zertifikat | Akzeptiere das Zertifikat im Browser oder verwende `-k` bei curl |

### Erweiterungsmöglichkeiten

- [ ] Authentifizierung (JWT/OAuth)
- [ ] Datenbank-Speicherung statt JSON-Datei
- [ ] Websocket-Support für Echtzeit-Updates
- [ ] Admin-Panel zur VM-Verwaltung
- [ ] Automatische VM-Status-Überwachung
- [ ] Benachrichtigungssystem (E-Mail, Slack)
- [ ] Metriken und Analytics
- [ ] Multi-Tenant-Support

---

## 📞 Support und Kontakt

**Autor:** Paul Buchwald  
**Für Fragen oder Probleme:**
- Überprüfen Sie die Logs in der Konsolenausgabe
- Konsultieren Sie die Fehler-Lookup-Tabelle oben
- Überprüfen Sie die SSL/TLS-Zertifikat-Konfiguration

---

## 📄 Lizenz

Dieses Projekt ist unter der **ISC-Lizenz** lizenziert.

---

## 🔄 Version-History

| Version | Datum | Änderungen |
|---------|-------|-----------|
| 1.0.0 | August 2025 | Initiale Version mit HTTPS-API und JSON-Datenspeicherung |
| 2.0.0 | Dezember 2025 | Update auf neue Pool Vms |


---

## ✅ Checkliste für Deployment

- [ ] Node.js und npm installiert
- [ ] Abhängigkeiten mit `npm install` installiert
- [ ] SSL/TLS-Zertifikat und Schlüssel vorhanden
- [ ] Zertifikatspfade in Server.js aktualisiert
- [ ] `vm_status.json` vorhanden und korrekt formatiert
- [ ] Port 3000 ist verfügbar
- [ ] Firewall-Regeln für Port 3000 konfiguriert
- [ ] Server mit `npm start` erfolgreich gestartet
- [ ] API-Endpunkt antwortet (z.B. mit curl)
- [ ] Monitoring und Logging aktiviert
