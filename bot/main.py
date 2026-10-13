"""Kadr bot: opens the cinema Mini App and confirms tickets the app sends back.

The Mini App is opened from a reply-keyboard button, because only keyboard-button
launches may call Telegram.WebApp.sendData(); the ticket arrives here as
`message.web_app_data` and the bot answers with a formatted confirmation.
"""

import asyncio
import json
import logging
import os
from datetime import date

from aiogram import Bot, Dispatcher, F, Router, html
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiogram.filters import CommandStart
from aiogram.types import KeyboardButton, MenuButtonWebApp, Message, ReplyKeyboardMarkup, WebAppInfo
from dotenv import load_dotenv

load_dotenv()
WEBAPP_URL = os.getenv("WEBAPP_URL", "https://cdduke.github.io/kadr-miniapp/")
MAX_SEATS = 6

router = Router()


def app_keyboard() -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(
        keyboard=[[KeyboardButton(text="🎬 Открыть афишу", web_app=WebAppInfo(url=WEBAPP_URL))]],
        resize_keyboard=True,
        input_field_placeholder="Выберите фильм в приложении",
    )


def _seat(key: object) -> str:
    row, _, num = str(key).partition("-")
    return f"ряд {row}, место {num}" if row.isdigit() and num.isdigit() else "—"


def _date(value: object) -> str:
    try:
        return date.fromisoformat(str(value)).strftime("%d.%m.%Y")
    except ValueError:
        return "—"


def format_ticket(data: dict) -> str:
    """Render the JSON payload from the Mini App. The payload comes from the client, so every field is escaped."""

    def field(key: str) -> str:
        return html.quote(str(data.get(key, "—"))[:80])

    seats = data.get("seats") if isinstance(data.get("seats"), list) else []
    total = data.get("total")
    price = f"{total:,}".replace(",", " ") + " ₽" if isinstance(total, int) else "—"
    return "\n".join(
        [
            f"🎟 <b>Билет {field('id')}</b>",
            "",
            f"🎬 {field('movie')}",
            f"📅 {_date(data.get('date'))} · {field('time')}",
            f"📍 {field('cinema')}, {field('hall')}",
            f"💺 {'; '.join(_seat(k) for k in seats[:MAX_SEATS]) or '—'}",
            f"💳 {price}",
            "",
            "Покажите QR-код из приложения на входе в зал. Приятного просмотра! 🍿",
        ]
    )


@router.message(CommandStart())
async def start(message: Message) -> None:
    name = html.quote(message.from_user.first_name) if message.from_user else "друг"
    await message.answer(
        f"Привет, {name}! 🍿\n\n"
        "В «Кадре» можно выбрать фильм, сеанс и места в зале — "
        "а подтверждение билета придёт прямо в этот чат.\n\n"
        "Нажмите кнопку внизу, чтобы открыть афишу.",
        reply_markup=app_keyboard(),
    )


@router.message(F.web_app_data)
async def ticket_from_app(message: Message) -> None:
    try:
        data = json.loads(message.web_app_data.data)
    except json.JSONDecodeError:
        data = None
    if not isinstance(data, dict) or data.get("type") != "ticket":
        await message.answer("Не удалось прочитать билет 😕 Попробуйте ещё раз из приложения.")
        return
    await message.answer(format_ticket(data), reply_markup=app_keyboard())


async def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
    bot = Bot(os.environ["BOT_TOKEN"], default=DefaultBotProperties(parse_mode=ParseMode.HTML))
    # the "menu" button next to the input field opens the app as well
    await bot.set_chat_menu_button(menu_button=MenuButtonWebApp(text="Афиша", web_app=WebAppInfo(url=WEBAPP_URL)))
    dp = Dispatcher()
    dp.include_router(router)
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
