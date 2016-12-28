using Rocket.Core.Plugins;
using System;
using Rocket.API.Collections;
using SDG.Unturned;
using Newtonsoft.Json;
using Quobject.SocketIoClientDotNet.Client;
using System.Text.RegularExpressions;
using Rocket.Core.Logging;

namespace DiscordBot
{
    public class ChatBotPlugin : RocketPlugin<ChatBotConfiguration>
    {
        private Socket socket;

        public override TranslationList DefaultTranslations
        {
            get
            {
                return new TranslationList() {
                        { "UNTURNED_CHAT_FORMAT", "[{0}] {1}" },
                        { "BRIDGE_CHAT_FORMAT", "[{0}] {1}" },
                    };
            }
        }

        protected override void Load()
        {
            try
            {
                socket = IO.Socket(Configuration.Instance.Address);
                Rocket.Unturned.Events.UnturnedPlayerEvents.OnPlayerChatted += (Rocket.Unturned.Player.UnturnedPlayer player, ref UnityEngine.Color color, string message, EChatMode chatMode, ref bool cancel) =>
                {
                    if (chatMode == EChatMode.GLOBAL && !String.IsNullOrEmpty(player.Id) && player.Id != "0" && !message.StartsWith("/") && !message.StartsWith("@"))
                    {
                        string m = Translate("BRIDGE_CHAT_FORMAT", player.DisplayName, message);
                        if(Configuration.Instance.ShowRelayedMessages)
                            Console.WriteLine(" << " + m);
                        socket.Emit("receive", m);
                    }
                };
                socket.On("connect", () =>
                {
                    Logger.Log("Connected to bridge");
                });

                socket.On("disconnect", () =>
                {
                    Logger.Log("Disconnected from bridge");
                });

                socket.On("error", (arguments) =>
                {
                    Console.WriteLine(arguments);
                });

                socket.On("send", (arguments) =>
                {
                    try
                    {
                        string[] response = JsonConvert.DeserializeObject<string[]>(arguments.ToString());
                        string message = Translate("UNTURNED_CHAT_FORMAT", response[0], Regex.Replace(response[1], @"\p{Cs}", ""));
                        if (Configuration.Instance.ShowRelayedMessages)
                            Console.WriteLine(" >> " + message);
                        Rocket.Unturned.Chat.UnturnedChat.Say(message);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex);
                    }
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
            }
        }
    }
}