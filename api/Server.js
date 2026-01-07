/**
 * ============================================================================
 * VM-Monitor API Server
 * ============================================================================
 * 
 * Beschreibung:
 * Ein sicherer HTTPS-Server, der die Statusdaten von virtuellen Maschinen
 * bereitstellt. Der Server liest VM-Informationen aus einer JSON-Datei und
 * stellt diese über eine REST-API zur Verfügung.
 * 
 * @version: 2.0.0
 * @author: Paul Buchwald
 * @since: August 2025
 * 
 * ============================================================================
 */

// Erforderliche Module laden
const express = require('express');                    // Express.js Framework
const fs = require('fs');                              // Dateisystem-Modul
const fsPromises = require('fs').promises;             // Asynchrone Dateisystem-Operationen
const path = require('path');                          // Pfad-Modul
const https = require('https');                        // HTTPS-Modul

// Express-Anwendung initialisieren
const app = express();

// Server-Port definieren
const port = 3000;

/**
 * HTTPS-Optionen
 * 
 * Enthält die SSL/TLS-Zertifikate für die sichere Kommunikation:
 * - key: Privater Schlüssel
 * - cert: Öffentliches Zertifikat
 */
const httpsOptions = {
  key: fs.readFileSync('c:/xampp/apache/conf/ssl.key/itsv2689.key'),   
  cert: fs.readFileSync('c:/xampp/apache/conf/ssl.crt/certificate_itsv2689.crt'),
};

/**
 * Pfad zur VM-Status-Datei
 * 
 * Definiert die Stelle, wo die VM-Statusdaten gespeichert sind.
 * Die Datei liegt eine Ebene über dem api-Verzeichnis.
 */
const DATEI_PFAD = path.join(__dirname, '..', 'vm_status.json');
console.log(`Datei: ${DATEI_PFAD}`);

/**
 * GET /api/vm/vmstatus
 * 
 * Beschreibung:
 * Ruft die aktuelle Liste aller virtuellen Maschinen ab.
 * 
 * Rückgabe:
 * - 200 OK: JSON-Array mit VM-Informationen
 *   {
 *     "vms": [
 *       {"name": "VM-Name", "online": true/false, "users": Anzahl}
 *     ]
 *   }
 * - 404 Not Found: Wenn die Statusdatei nicht existiert
 * - 500 Internal Server Error: Bei JSON-Parsing-Fehler oder anderen Fehlern
 * 
 * Fehlerbehandlung:
 * - ENOENT (Datei nicht gefunden): 404 Fehler mit entsprechender Nachricht
 * - SyntaxError (ungültiges JSON-Format): 500 Fehler mit Formatfehlermeldung
 * - Sonstige Fehler: 500 Fehler mit allgemeiner Fehlermeldung
 */
app.get('/api/vm/vmstatus', async (req, res) => {
  try {
    // Dateiinhalt asynchron lesen
    const dateiInhalt = await fsPromises.readFile(DATEI_PFAD, 'utf8');
    
    // JSON-String in Objekt konvertieren
    const daten = JSON.parse(dateiInhalt);
    
    // Daten an Client zurückgeben
    res.json(daten);
  } catch (fehler) {
    // Spezifische Fehlerbehandlung
    if (fehler.code === 'ENOENT') {
      // Datei nicht gefunden
      res.status(404).json({ fehler: 'Datei nicht gefunden' });
    } else if (fehler instanceof SyntaxError) {
      // JSON-Format ist ungültig
      res.status(500).json({ fehler: 'JSON-Format ist ungültig' });
    } else {
      // Unerwarteter Fehler
      console.error(fehler);
      res.status(500).json({ fehler: 'Interner Fehler - siehe Konsolenausgabe' });
    }
  }
});

/**
 * HTTPS-Server starten
 * 
 * Erstellt einen HTTPS-Server mit den definierten SSL/TLS-Optionen
 * und startet diesen auf dem angegebenen Port.
 */
https.createServer(httpsOptions, app).listen(port, () => {
  console.log(`HTTPS-Server läuft auf Port ${port}`);
});