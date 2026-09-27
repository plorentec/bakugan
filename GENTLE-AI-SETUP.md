# Gentle-AI Setup

## Instalación

```bash
curl -fsSL https://raw.githubusercontent.com/Gentleman-Programming/gentle-ai/main/scripts/install.sh | bash
```

## Configuración para OpenCode

```bash
gentle-ai install --agent opencode --scope workspace
```

## PATH

Agregar a `~/.bashrc`:

```bash
export PATH="$PATH:/home/agent/.local/bin:/home/agent/go/bin"
```

## Verificación

```bash
gentle-ai doctor
```

## Herramientas instaladas

| Herramienta | Versión | Ubicación |
|-------------|---------|-----------|
| gentle-ai | 3.7.0 | `/home/agent/.local/bin/gentle-ai` |
| engram | 2.2.1 | `/home/agent/.local/bin/engram` |
| gga | - | `/home/agent/.local/bin/gga` |

## Reiniciar OpenCode

1. Ejecutar `/exit` para salir
2. Ejecutar `opencode` para iniciar nueva sesión
3. Verificar con `opencode mcp list` que Engram esté conectado

## Comandos útiles

```bash
gentle-ai doctor          # Verificar salud del sistema
gentle-ai sync            # Sincronizar configs y skills
gentle-ai --help          # Ver ayuda completa
```

## Documentación

- [GitHub](https://github.com/Gentleman-Programming/gentle-ai)
- [Quickstart](https://github.com/Gentleman-Programming/gentle-ai/blob/main/docs/quickstart.md)
- [Agents](https://github.com/Gentleman-Programming/gentle-ai/blob/main/docs/agents.md)
