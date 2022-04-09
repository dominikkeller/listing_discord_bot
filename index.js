const Discord = require("discord.js");
const OpenseaScraper = require("opensea-scraper");
require("dotenv").config(); //initialize dotenv

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require("node-localstorage").LocalStorage;
  localStorage = new LocalStorage("./scratch");
}
var localStorage = new LocalStorage("./offers");

const SLUG = process.env.SLUG;
const CLIENT_TOKEN = process.env.CLIENT_TOKEN;

// options
const options = {
  debug: true,
  logs: true,
  sort: true,
  browserInstance: undefined,
};

const client = new Discord.Client({ intents: [] });
client.login(CLIENT_TOKEN);

client.on("ready", async () => {
  const basicInfo = await OpenseaScraper.basicInfo(SLUG, options);
  //client.user.setAvatar(basicInfo.imageUrl);

  let result = await OpenseaScraper.offers(SLUG, options);
  await saveOffers(result.offers);
  await getOffers();
  /*setInterval(async function () {
    try {
        let result = await OpenseaScraper.offers(slug, options);
        console.log(result);
      
    } catch (e) {
      console.log(e.toString());
    }
  }, 4000);*/
});

async function getOffers() {
  const offers = localStorage.getItem("offers");
  console.log(JSON.parse(offers));
}

async function saveOffers(data) {
  localStorage.setItem("offers", JSON.stringify(data)); //store colors
}
