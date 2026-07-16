# InnerChispa Web Staging Plan

**Fecha:** 2026-07-14 15:55 GMT-5

## Fuente actual respaldada
- `/home/rlopez/projects/hackathon-autopilot/templates/index.html`
- Backup: `/home/rlopez/projects/hackathon-autopilot/staging/innerchispa-web/backups/index_20260714.html`
- Proyecto origen: `/home/rlopez/projects/hackathon-autopilot`
- Manifest canónico: `/home/rlopez/projects/hackathon-autopilot/PROJECT_MANIFEST.json`

## Estado actual del sitio
El HTML actual es un dashboard de conocimiento / hackatones con:
- switch de idioma EN/ES
- panel de tecnologías
- central de agentes IA
- pestañas para Copiloto IA, Banco de Código, Buscar Código, Comunidad, Estratega de Hackatón, Radar de Fondos, Extractores y Fuentes, Logs
- soporte PWA y actualización de minería
- salida de sesión

## Lo que conviene extraer para la nueva web corporativa
- Home de InnerChispa / Ralphi IA
- Proyectos
- Hackatones
- Tecnología / capacidades
- Contacto
- Legal / Privacy

## Propuesta de estructura Astro (staging)
- `src/pages/index.astro` -> Home
- `src/pages/ralphi-ia.astro`
- `src/pages/proyectos.astro`
- `src/pages/hackatones.astro`
- `src/pages/tecnologia.astro`
- `src/pages/contacto.astro`
- `src/pages/privacy.astro`

## Reglas
- No tocar producción.
- Reutilizar contenido del dashboard actual solo como fuente.
- Mantener staging en carpeta separada.
- Las rutas y páginas nuevas deben alinearse con el inventario de proyectos y hackatones del ecosistema.

## Manifest observado
```json
{
  "slug": "hackathon-autopilot",
  "name": "Hackathon Autopilot Web",
  "lifecycle": "always_alive",
  "rules": [
    "Un solo camino: scripts/ralphia_project_create.py",
    "Servicios HTTP = always_alive + systemd user + Restart=always",
    "Puertos dinámicos 8120–8999; reservados en PORTS_CANONICAL.md",
    "Reinicio: bash scripts/restart_ralphia.sh (plataforma) o systemctl --user restart ralf-{slug}"
  ]
}
```
