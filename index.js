const Discord = require("discord.js");
const { Intents } = require("discord.js");

const OpenseaScraper = require("opensea-scraper");
require("dotenv").config(); //initialize dotenv

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require("node-localstorage").LocalStorage;
  var localStorage = new LocalStorage("./offers");
}

const SLUG = process.env.SLUG;
const CLIENT_TOKEN = process.env.CLIENT_TOKEN;
const USERNAME = process.env.USERNAME;
const CHANNEL_ID = process.env.CHANNEL_ID;

// options
const options = {
  debug: false,
  logs: false,
  sort: true,
  browserInstance: undefined,
};

const client = new Discord.Client({
  intents: [Intents.FLAGS.GUILD_MESSAGES],
});
client.login(CLIENT_TOKEN);

client.on("ready", async () => {
  let basicInfo = await OpenseaScraper.basicInfo(SLUG, options);
  client.user.setAvatar(basicInfo.imageUrl);
  client.user.setUsername(USERNAME);

  setInterval(async function () {
    try {
      let result = await OpenseaScraper.offers(SLUG, options);
      const upToDateOffers = result.offers;
      await checkNewOffers(upToDateOffers);
      await saveOffers(upToDateOffers);
    } catch (e) {
      console.log(e.toString());
    }
  }, 120000);
});

client.on("messageCreate", async (msg) => {
  switch (msg.content) {
    case "!offers":
      const offers = await getOffers();
      offers.map((offer) =>
        msg.channel.send(
          `${offer.name} for ${offer.floorPrice.amount} ETH: => ${offer.offerUrl} \r\n`
        )
      );
      break;
  }
});

async function getOffers() {
  const offers = localStorage.getItem("offers");
  return JSON.parse(offers);
}

async function saveOffers(data) {
  localStorage.setItem("offers", JSON.stringify(data)); //store colors
}

async function checkNewOffers(data) {
  const savedOffers = await getOffers();

  savedOffers.forEach(async (offer) => {
    if (!(data.filter((t) => t.tokenId === offer.tokenId).length > 0)) {
      const channel = await client.channels.fetch(CHANNEL_ID);
      channel.send(
        `${offer.name} for ${offer.floorPrice.amount} ETH: => ${offer.offerUrl} \r\n`
      );
    }
  });
}
