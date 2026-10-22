import "server-only";

export default async function sendDiscordEvent(
  title: string,
  description: string
) {
  const token = process.env.DISCORD_TOKEN;
  const channelId = process.env.DISCORD_CHANNEL_ID;

  if (!token || !channelId) {
    throw new Error("Discord configuration missing");
  }

  const response = await fetch(
    `https://discord.com/api/v10/channels/${channelId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bot ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        embeds: [
          {
            title: "Ny event oprettet!",
            description: `**${title}**\n\n${description}`,
            color: 0x5865f2,
          },
        ],
      }),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      `Discord API error: ${response.status} ${await response.text()}`
    );
  }
}
