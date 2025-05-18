const fs = require('fs').promises;
const puppeteer = require('puppeteer');

module.exports.puppet = {
    browser: null,
    browserWSEndpoint: null,
    page: null,
    startedOn: new Date(),
    completedOn: null,
    status: 'CREATED',

    start: async () => {
        this.startedOn = new Date();
    },

    complete: async () => {
        this.completedOn = new Date();
    }
}

module.exports.listPages = async () => {
    const pages = await this.puppet.browser.pages();

    console.log('> pages: ' + pages.length);
}

module.exports.saveCookies = async () => {
    const saveCookies = await this.puppet.page.cookies();
    await fs.writeFile('./cookies.json', JSON.stringify(saveCookies, null, 2));

    console.log('> Cookies saved...');
}

/**
 *  Initialize the Puppeteer client with required information to run a request:
 *
 **/
module.exports.init = async (params) => {
    console.log('> init: ' + JSON.stringify(params));

    //this.awsId = params.accessKey;
    //this.awsSecret = params.secretKey;
    //this.associateId = params.associateId;

    this.puppet.browser = await puppeteer.launch({headless: false, userDataDir: '/tmp/data'}); // , args: ['--no-sandbox', '--disable-setuid-sandbox'], slowMo: 250, headless: false, userDataDir: '/tmp/data'
    this.puppet.page = await this.puppet.browser.newPage();

    const cookiesString = await fs.readFile('./cookies.json');
    const cookies = JSON.parse(cookiesString);
    await this.puppet.page.setCookie(...cookies);

    await this.puppet.page.setViewport({ width: 1024, height: 1600 });

    await this.puppet.page.goto(`https://www.google.com`);

    console.log('> init complete...');
}