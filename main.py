from dotenv import load_dotenv
from datetime import datetime
import asyncio

from livekit.agents import Agent, WorkerOptions, cli
from livekit.plugins import silero

load_dotenv()


class VoiceAgent(Agent):
    def __init__(self):
        super().__init__(
            instructions=(
                "You are a simple voice assistant. "
                "Respond politely and briefly. "
                "You can say hello, tell the time, and stop when asked."
            )
        )

    async def on_start(self):
        print("🚀 VoiceAgent STARTED")
        print(f"🏠 Joined room: {self.room.name}")

        # ---- Load models once ----
        self.vad = silero.VAD.load()
        self.stt = silero.STT.load()
        self.tts = silero.TTS.load()

        # ---- Attach audio pipeline ----
        self.audio_in = self.room.audio_input(
            vad=self.vad,
            stt=self.stt,
        )

        self.audio_out = self.room.audio_output(
            tts=self.tts
        )

        await self.audio_out.say(
            "Hello! I am ready. Say hello, time, or stop.",
            allow_interruptions=True,
        )

        # ---- Keep agent alive indicator ----
        asyncio.create_task(self._heartbeat())

    async def _heartbeat(self):
        while True:
            print("💓 agent alive")
            await asyncio.sleep(10)

    async def on_user_input(self, text: str):
        text = text.strip().lower()
        print("🗣 USER:", text)

        if not text:
            return

        if "hello" in text:
            await self.audio_out.say("Hello! Nice to meet you.")

        elif "time" in text:
            now = datetime.now().strftime("%I:%M %p")
            await self.audio_out.say(f"The time is {now}")

        elif "stop" in text or "bye" in text:
            await self.audio_out.say("Goodbye!")
            await self.shutdown()

        else:
            await self.audio_out.say("I heard you.")

    async def on_shutdown(self):
        print("🛑 VoiceAgent shutting down cleanly")


async def entrypoint(ctx):
    print("✅ Entrypoint called")
    return VoiceAgent()


if __name__ == "__main__":
    print("🔥 main.py loaded")
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
        )
    )










# from dotenv import load_dotenv
# from datetime import datetime

# from livekit.agents import Agent, WorkerOptions, cli
# from livekit.plugins import silero

# load_dotenv()


# class VoiceAgent(Agent):
#     def __init__(self):
#         super().__init__(
#             instructions=(
#                 "You are a simple voice assistant. "
#                 "You respond politely and briefly. "
#                 "You can say hello, tell the time, and stop when asked."
#             )
#         )

#     async def on_start(self):
#         print("🚀 VoiceAgent started")

#         # Load Silero models
#         self.vad = silero.VAD.load()
#         self.stt = silero.STT.load()
#         self.tts = silero.TTS.load()

#         # Attach audio IO
#         self.audio_in = self.room.audio_input(
#             vad=self.vad,
#             stt=self.stt,
#         )
#         self.audio_out = self.room.audio_output(
#             tts=self.tts
#         )

#         await self.audio_out.say(
#             "Hello! I am your AI voice assistant. Say hello, time, or stop.",
#             allow_interruptions=True,
#         )

#     async def on_user_input(self, text: str):
#         print("🗣 User:", text)
#         text = text.lower()

#         if "hello" in text:
#             await self.audio_out.say("Hello! Nice to meet you.")

#         elif "time" in text:
#             now = datetime.now().strftime("%H:%M")
#             await self.audio_out.say(f"The time is {now}")

#         elif "stop" in text:
#             await self.audio_out.say("Goodbye!")
#             await self.shutdown()

#         else:
#             await self.audio_out.say("I heard you.")


# async def entrypoint(ctx):
#     # MUST return the agent instance
#     return VoiceAgent()


# if __name__ == "__main__":
#     cli.run_app(
#         WorkerOptions(
#             entrypoint_fnc=entrypoint
#         )
#     )
