const { Telegraf } = require('telegraf');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { pipeline } = require('stream');

const bot = new Telegraf("7876790330:AAFHarmpcl6XVuzYZU6naQYf_KU9aUQunFQ");

let onstartmsg = "Salom! Men sizga qo'shiq topib berishim mumkin, Qo'shiq nomini yuboring...";

bot.start((ctx) => ctx.reply(onstartmsg));

const downloadFile = async (url, filePath) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to download file: ${response.statusText}`);

    const streamPipeline = promisify(pipeline);
    await streamPipeline(response.body, fs.createWriteStream(filePath));
};

bot.on('text', async (ctx) => {

    let  term = ctx.message.text;

    let endpoint = "https://www.shazam.com/services/amapi/v1/catalog/UZ/search?";
    endpoint = endpoint + "term=" + term + "&limit=1&types=songs,artists";

    try {
        const response = await fetch(endpoint);
        const data = await response.json();

        // ctx.reply("JSON: " + data.results);

        if (data.results && data.results.songs && data.results.songs.data.length > 0) {
            const song = data.results.songs.data[0]; // data.results -> data.result bo'lishi kerak
            const songName = song.attributes.name;
            const artistName = song.attributes.artistName;
            const previewUrl = song.attributes.previews[0].url;

            const fileName = `${artistName}-${songName}.mp3`;
            const filePath = path.join(__dirname, fileName);

            // Faylni yuklab olish
            await downloadFile(previewUrl, filePath);
            // Qo'shiqni yuborish
            await ctx.replyWithAudio({ source: filePath });

            // Faylni o'chirish
            fs.unlinkSync(filePath);
        } else {
            ctx.reply("Afsuski, siz kiritgan qo'shiq topilmadi.");
        }

    } catch (error) {
        console.error('Xatolik yuz berdi:', error);
        ctx.reply('Ma\'lumot olishda xatolik yuz berdi.');
    }
});

bot.launch();
