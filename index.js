const {Telegraf} = require('telegraf');
const fs = require('fs');
const path = require('path');
const {promisify} = require('util');
const {pipeline} = require('stream');

const bot = new Telegraf("7876790330:AAFHarmpcl6XVuzYZU6naQYf_KU9aUQunFQ")

let onstartmsg = "Salom! Men sizga qo'shiq topib berishim mumkin,Qo'shiq nomini yuboring..."

bot.start((ctx) => ctx.reply(onstartmsg))

const dowloadFile = async (url, filePath) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to download file:${response.statusText}');

    const streamPipeline = promisify(pipeline);
    await streamPipeline(response.body, fs.createWritestream(filePath));
};

bot.on('text', async (ctx) => {
    const term = ctx.message.text;
    let endpoint = "https://www.shazam.com/services/amapi/v1/catalog/UZ/search?"
    endpoint = endpoint + "term=" + term + "&limit=1&types=songs,artists"
    try {
        const respone = await fetch(endpoint);
        const data = await respone.json();
        if (data.result && data.result.songs && data.result.songs.data.length > 0) {
            const song = data.results.songs.data[0];
            const songName = song.attributes.name;
            const artistName = song.attributes.artistName;
            const previewUrl = song.attributes.previews[0].url;

            const fileName = artistName + "-" + songName + ".mp3";
            const filePath = path.join(__dirname, fileName);
            await dowloadFile(previewUrl, fileName);
            await ctx.replyWithAudio({source: filePath});
            fs.unlinkSync(filePath);
        } else {
            ctx.reply("Afsuski,siz kiritgan qo'shiq topilmadi.");
        }
    } catch (error) {
        console.error('Xatolik yuz berdi:', error);
        ctx.reply('Malumot olishda xatolik yuz berdi.');
    }

});
bot.launch()

