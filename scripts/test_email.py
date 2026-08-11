import asyncio
import time
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType

conf = ConnectionConfig(
    MAIL_USERNAME="venkatagouthamreddygogireddy@gmail.com",
    MAIL_PASSWORD="bikorqzgnobmdspf",
    MAIL_FROM="venkatagouthamreddygogireddy@gmail.com",
    MAIL_PORT=465,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_FROM_NAME="UniHealth AI",
    MAIL_STARTTLS=False,
    MAIL_SSL_TLS=True,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

async def test_email():
    print("Testing SMTP on port 465...")
    start = time.time()
    try:
        html = "<p>Test</p>"
        message = MessageSchema(
            subject="Test Port 465",
            recipients=["venkatagouthamreddygogireddy@gmail.com"],
            body=html,
            subtype=MessageType.html
        )
        fm = FastMail(conf)
        await fm.send_message(message)
        print(f"SMTP Success in {time.time() - start:.2f}s")
    except Exception as e:
        print(f"SMTP Failed: {e} in {time.time() - start:.2f}s")

if __name__ == "__main__":
    asyncio.run(test_email())
