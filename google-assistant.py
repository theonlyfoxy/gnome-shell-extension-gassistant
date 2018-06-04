#!/usr/bin/python3
# -*- coding: utf-8 -*-
import threading, time, sys, io, os, signal
folder = os.path.dirname(os.path.realpath(__file__))

#make sure the correct arguments are present
try:
    arg = sys.argv.pop(1)
    ["run", "kill"].index(arg)
except:
    print("The following are accepted: 'run', and 'kill'")
    sys.exit(0)
#try to kill any existant processes
try:
    with open("/tmp/assistant.pid", "r") as text_file:
        os.kill(int(text_file.read()), signal.SIGTERM)
except:
    pass
if arg == "kill":
    sys.exit(0)
#write PID for other processes
with open("/tmp/assistant.pid", "w") as text_file:
    text_file.write(str(os.getpid()))

try:
    from google.assistant.library.__main__ import main as assistant
except:
    os.system("gedit "+folder+"/howto.txt")

def save(message):
    #update shell extension here
    with open("/tmp/assistant.msg", "w") as text_file:
        text_file.write(message)

def signal_handler(signal, frame):
        save("💀")
        sys.exit(0)
signal.signal(signal.SIGTERM, signal_handler)

def play(file):
    os.system("aplay "+folder+"/"+file)
def lineout(line):
    if "ON_CONVERSATION_TURN_STARTED"in line:
        save("🎙")
        play("Enable.wav")
    elif "ON_END_OF_UTTERANCE" in line:
        save("⏳")
    elif "ON_RECOGNIZING_SPEECH_FINISHED" in line:
        save("⌛")
    elif "ON_NO_RESPONSE" in line:
        save("?")
    elif "ON_RESPONDING_STARTED" in line:
        save("🔊")
    elif "ON_RESPONDING_FINISHED" in line:
        save("🔈")
    elif "ON_CONVERSATION_TURN_FINISHED" in line:
        save("💤")

sys.stdout = output = io.StringIO()
process = threading.Thread(target=assistant)
process.daemon = True
process.start()
save("💤")

while True:
    time.sleep(.5)
    for line in output.getvalue().splitlines():
        lineout(line)
    output.truncate(0)
    output.seek(0)
