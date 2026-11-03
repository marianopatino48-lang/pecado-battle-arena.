PECADO: BATTLE ARENA ONLINE - PROTOTIPO

REQUISITOS
- Node.js 18 o superior.
- Un servicio de hosting que ejecute Node.js y permita WebSockets.
- Para probar localmente: instalar Node.js, abrir una terminal en esta carpeta y ejecutar:
    npm install
    npm start
  Luego abrir http://localhost:3000 en el navegador.

PUBLICAR ONLINE
1. Subir esta carpeta a un repositorio Git.
2. Crear un servicio web Node en un hosting compatible con WebSockets.
3. Comando de instalación: npm install
4. Comando de inicio: npm start
5. Abrir la URL HTTPS que entregue el hosting desde dos dispositivos diferentes.

IMPORTANTE
- El servidor guarda jugadores, solicitudes y salas en memoria. Al reiniciarse, esos datos se borran.
- La sala pública y las salas privadas son prototipo; aún no hay invitación selectiva a un amigo, persistencia de cuentas, matchmaking real, ni sistema competitivo.
- El disparo actual es visual y no implementa daño/armas completas.
- No compartas datos personales. Usá apodos; el chat necesita moderación adicional antes de abrirlo al público.
- No es todavía un APK. Esta web puede convertirse en APK en una etapa posterior.
