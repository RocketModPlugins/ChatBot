using System;
using Rocket.API;

namespace DiscordBot
{
    public class ChatBotConfiguration: IRocketPluginConfiguration
    {
        public string Address { get; internal set; } = "ws://127.0.0.1:80";
        public bool ShowRelayedMessages { get; internal set; } = false;

        public void LoadDefaults()
        {
            Address = "ws://127.0.0.1:80";
            ShowRelayedMessages = false;
        }
    }
}