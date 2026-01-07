@echo off
setlocal enabledelayedexpansion

title VM Status Monitor - THE FINAL VERSION
color 09

:: ====================================================================
:: Globaler Selbstsperrmechanismus zur Verhinderung mehrerer Instanzen
:: ====================================================================
set "LOCKFILE=C:\Windows\Temp\vm_monitor.lock"
2>nul (
  >>"%LOCKFILE%" (
    goto :MainLogic
  )
) && (
  color 0C
  echo. & echo  FEHLER: Eine andere Instanz des Skripts läuft bereits.
  echo  (Sperrdatei gefunden unter %LOCKFILE%)
  echo. & echo  Dieses Fenster schließt sich in 10 Sekunden...
  timeout /t 10 >nul
  exit /b
)

:MainLogic
echo Sperrdatei erstellt. Skript läuft jetzt kontinuierlich.
echo Zum Beenden einfach dieses Fenster schließen oder Strg+C drücken.
echo.

:MainLoop
echo ======================================================================
echo [%time%] Starte VM-Abfragezyklus...
echo.

set "JSON_FILE=vm_status.json"
set "UNIQUE_TEMP_FILE=query_temp_%RANDOM%.txt"
set "VM_LIST=PVM01 PVM02 PVM03 PVM04 PVM05 PVM06 PVM07 PVM08 PVM09 PVM10"

REM JSON-Datei jedes Mal von vorne beginnen
echo { > "%JSON_FILE%"
echo   "vms": [ >> "%JSON_FILE%"

set /a vm_index=0
set /a vm_total=10

REM Durchlaufe alle VMs mit der bewährten mehrzeiligen Logik
for %%V in (!VM_LIST!) do (
    set /a vm_index+=1
    set "vm_name=%%V"
    echo   -> Checking !vm_name!...

    query user /server:!vm_name! >"%UNIQUE_TEMP_FILE%" 2>&1
    findstr /i /c:"Fehler" "%UNIQUE_TEMP_FILE%" >nul 2>&1

    if !errorlevel! equ 0 (
        REM --- VM NICHT ERREICHBAR (RPC-FEHLER) ---
        echo     {"name": "!vm_name!", "online": false, "users": 0}>> "%JSON_FILE%"
    ) else (
        findstr /i /c:"BENUTZERNAME" "%UNIQUE_TEMP_FILE%" >nul 2>&1
        if !errorlevel! equ 0 (
            set user_count=0
            for /f %%i in ('type "%UNIQUE_TEMP_FILE%" ^| find /c /v ""') do set /a user_count=%%i-1
            if !user_count! lss 0 set user_count=0
            echo     {"name": "!vm_name!", "online": true, "users": !user_count!}>> "%JSON_FILE%"
        ) else (
            echo     {"name": "!vm_name!", "online": true, "users": 0}>> "%JSON_FILE%"
        )
    )

    REM Komma hinzufügen, wenn es NICHT die letzte VM ist
    if !vm_index! lss !vm_total! (
        echo ,>> "%JSON_FILE%"
    )
)

REM JSON-Datei schließen
echo. >> "%JSON_FILE%"
echo   ] >> "%JSON_FILE%"
echo } >> "%JSON_FILE%"

REM Aufräumen der temporären Datei
if exist "%UNIQUE_TEMP_FILE%" del "%UNIQUE_TEMP_FILE%" >nul 2>&1

echo.
echo [%time%] Abfrage abgeschlossen. Warte 60 Sekunden...
echo ======================================================================
echo.

timeout /t 60 /nobreak >nul
goto MainLoop