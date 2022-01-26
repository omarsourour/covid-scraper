const jsdom = require('jsdom');
const readline = require('readline');
const puppeteer = require('puppeteer');
const player = require('play-sound')();

const { JSDOM } = jsdom;

const askQuestion = (query) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    return new Promise((resolve) =>
        rl.question(query, (ans) => {
            rl.close();
            resolve(ans);
        })
    );
};

const getUrlSlug = (userChoice) => {
    switch (userChoice) {
        case '1':
            return 'pYl3VA';
        case '2':
            return 'pnjLMp';
        case '3':
            return 'AX1lop';
        case '4':
            return 'AGLwjj';
        case '5':
            return 'AvJ3xA';
        case '6':
            return 'gdZeQA';
        case '7':
            return '0kOjO0';
        default:
            return undefined;
    }
};

const pollBrowser = async (slug) => {
    const browser = await puppeteer.launch({ headless: true, ignoreHTTPSErrors: true });
    const page = await browser.newPage();
    const url = `https://www.solvhealth.com/book-online/${slug}`;

    let timeSlots;
    let trial = 0;

    await page.goto(url, { waitUntil: 'networkidle0' });

    do {
        const data = await page.content();
        const dom = new JSDOM(data);
        timeSlots = dom.window.document.querySelectorAll('[data-testid="timeSlot"]');

        if (timeSlots.length > 0) {
            console.log('Appointment slot found!');
            player.play('./roadrunner.mp3');
            await page.close();
            break;
        } else {
            console.log(`Trial ${++trial}: Appointment not found. Retrying in 5 seconds ...`);
            await new Promise((resolve) => setTimeout(resolve, 5000));
            await page.reload({ waitUntil: 'networkidle0' });
        }
    } while (timeSlots.length === 0);
};

const main = async () => {
    console.log(`
Available free COVID sites:
---------------------------
1. West Seattle: (2801 SW Thistle St Seattle)
2. Sodo Site: (3822 6th Ave S Seattle)
3. University Of Washington: (4113 Franklin Pl NE, e04 Seattle)
4. Shoreline: (15499 15th Ave NE, Parking Lot behind the DOH building Shoreline)
5. Rainier Beach: (8445 Rainier Ave S Seattle)
6. Bellevue: (2645 145th Ave SE Bellevue)
7. Aurora Site: (12040 Aurora Ave N Seattle)
`);

    const choice = await askQuestion('Type in site number to poll: ');
    const slug = getUrlSlug(choice);

    if (!slug) {
        console.log('Invalid choice! Exiting.');
        return;
    }

    await pollBrowser(slug);
};

main();
