# Releasing

Версионирование и `CHANGELOG.md` автоматизированы через
[release-please](https://github.com/googleapis/release-please)
(`.github/workflows/release-please.yml`), на основе истории коммитов в формате
[Conventional Commits](../CONTRIBUTING.md) в ветке `main`.

## Как это устроено

- Единая версия на весь монорепозиторий (`release-please-config.json`,
  `release-type: "simple"`, пакет `"."`). Backend и frontend всегда
  деплоятся вместе одним `docker-compose.yml`, поэтому раздельное
  версионирование не имеет смысла.
- Текущая версия хранится в `.release-please-manifest.json`, а не в каком-либо
  файле пакета (frontend `package.json` как был `0.0.0`, так и остаётся —
  release-please его не трогает).
- При каждом пуше в `main` release-please анализирует коммиты со времени
  последнего релиза и создаёт/обновляет один и тот же PR вида
  `chore(main): release X.Y.Z` с сгенерированным `CHANGELOG.md` и предложенной
  версией (bump по `fix`/`feat`/`BREAKING CHANGE` в заголовках коммитов).
- Мёрдж этого PR создаёт git tag и GitHub Release.

## Ограничение GITHUB_TOKEN

Дефолтного `GITHUB_TOKEN` достаточно, чтобы release-please создавал/обновлял
release-PR и сам релиз. Ограничение: коммиты и теги, созданные с дефолтным
токеном, не триггерят другие workflow на `push`/`release`. Сейчас в репозитории
нет workflow, зависящих от события релиза (например, «собрать и запушить
Docker-образ по тегу»), так что это не блокер. Если такой workflow появится —
понадобится fine-grained PAT или GitHub App token, переданный через `token:`
инпут `googleapis/release-please-action`.

## Проверка после мёрджа

1. Смёржить PR с conventional-commit-совместимым сообщением в `main`.
2. В GitHub Actions убедиться, что workflow `release-please` отработал на этот пуш.
3. Убедиться, что появился PR вида `chore(main): release X.Y.Z` с
   сгенерированным `CHANGELOG.md`.
4. Смёржить в `main` ещё один мелкий `fix:`/`feat:`-коммит и убедиться, что
   **тот же** release-PR обновился (не задублировался).
5. Смёржить сам release-PR — убедиться, что release-please создал GitHub
   Release и git tag (`vX.Y.Z`).
