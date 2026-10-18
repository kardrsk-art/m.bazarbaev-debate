ОБНОВЛЕНИЕ САЙТА НА VERCEL (GitHub)

1. Замените в репозитории файлы: index.html и api/chat.js (Add file -> Upload files, затем Commit).
2. Vercel сам пересоберёт сайт за ~1 минуту.
3. ВАЖНО про ключ Gemini:
   - Ключ нельзя писать в index.html: его увидят все. Он хранится только в Vercel.
   - Vercel -> Settings -> Environment Variables -> GEMINI_API_KEY = ваш НОВЫЙ ключ.
   - Если вы отправляли ключ в чат или в открытый код, удалите его на aistudio.google.com (API keys) и создайте новый.
   - Если модель не отвечает, добавьте GEMINI_MODEL = точное имя модели из AI Studio (gemini-1.5-flash уже может быть отключена).
   - После изменения переменных нажмите Deployments -> Redeploy.
