# Contributing

## Формат коммитов

Этот репозиторий использует [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer(s)]
```

**Допустимые типы:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`,
`build`, `ci`, `chore`, `revert`.

**Рекомендуемые (необязательные) scope:** `backend`, `frontend`, `e2e`, `ci`,
`release`, `deps` — это гайдлайн для читаемости истории, а не жёсткое правило
(scope не enforced отдельным списком в `commitlint.config.js`).

Примеры:
```
feat(frontend): add drag-and-drop for calendar slots
fix(backend): reject overlapping bookings with 409
ci: add playwright e2e job
```

### Это касается и коммитов, сделанных ИИ-агентом

Если коммит создаётся ассистентом/агентом (в том числе с трейлером
`Co-Authored-By: ...`), заголовок коммита всё равно должен быть валидным
Conventional Commit — трейлер не заменяет тип/описание. Локальный git-хук
(`commit-msg`, husky) может не сработать для агента, если коммит делается в
среде без `npm install` — поэтому реальная точка контроля для агентских
коммитов **CI-проверка** (`.github/workflows/commitlint.yml`), которая линтит
каждый коммит в диапазоне PR независимо от того, выполнялся ли локальный хук.

## Локальная проверка коммитов

```
npm install   # один раз в корне репозитория — ставит husky + commitlint и вешает commit-msg хук
```

После этого `git commit` будет автоматически проверяться commitlint; при
несоответствии формату коммит будет отклонён с пояснением, что не так.

Если коммит делается из среды, где `npm`/`npx` не в `PATH` (частый случай для
GUI git-клиентов), локальный хук молча пропускает проверку с предупреждением
в stderr — это не страшно, поскольку финальная проверка всё равно происходит
в CI (см. ниже).

## CI-проверка

На каждый pull request прогоняется `commitlint` workflow
(`wagoid/commitlint-github-action`), который проверяет все коммиты PR. Это
единственная гарантия для коммитов, сделанных не через локальный git (в т.ч.
агентом или через веб-интерфейс GitHub).

## Релизы

Версионирование и changelog автоматизированы через
[release-please](https://github.com/googleapis/release-please) на основе
Conventional Commits в `main`. См. `docs/releasing.md`.
