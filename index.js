const fs = require("fs");
const path = require("path");
const puppeteer = require('puppeteer');
const handlebars = require("handlebars");
const glob = require('glob');
const merge = require('easy-pdf-merge');

const express = require('express');
const bodyParser = require('body-parser');
let app = express();
const jsonParser = bodyParser.json()

async function convertDate(date){
	if ( typeof date !== 'undefined' && date ) {
		dateChangeFormat = `${date.substr(8, 2)}/${date.substr(5, 2)}/${Number(date.substr(0, 4)) + 543}`
	}else{
		dateChangeFormat = ""
	}
	return dateChangeFormat
}

async function createPDF(data, milis, lang, num_of_page, landscape_status){

	var raw_static_label = await fs.readFileSync(`template/page_${num_of_page}/static_label_${lang}.json`);
	var static_label = await JSON.parse(raw_static_label);

	var templateHtml = await fs.readFileSync(path.join(process.cwd() + `/template/page_${num_of_page}/`, `page.html`), 'utf8');
	
	var template = handlebars.compile(templateHtml);

	data.data.jobs.created_at = await convertDate(data.data.jobs.created_at);
	data.data.jobs.appointment_date = await convertDate(data.data.jobs.appointment_date);

	data = {
		"static_label": static_label, 
		"data": data.data
	}
	var html = template(data);

	var pdfPath = path.join('pdf', `${milis}-page_${num_of_page}.pdf`);

	var options = {
		printBackground: true,
		path: pdfPath,
		format: 'A4',
		landscape: landscape_status,
	}

	const browser = await puppeteer.launch({
		args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security', '--font-render-hinting=none'],
		headless: true
	});

	var page = await browser.newPage();
	
	await page.goto(`data:text/html;charset=UTF-8,${html}`, {
		waitUntil: 'networkidle0'
	});

	await page.addStyleTag({path: `template/page_${num_of_page}/style.css`})

	await page.pdf(options);
	await browser.close();
}

app.post('/download', jsonParser, async function (req, res, next) {

	var milis = new Date();
	milis = milis.getTime();

	await createPDF(req.body, milis, 'th', '01', false); //landscape_status
	await createPDF(req.body, milis, 'th', '02', true);
	
	var files = await glob.sync(`pdf/${milis}-*.pdf`, {});

	await merge(files, `pdf/${milis}.pdf`, function(err) {
		if(err) {
			return console.log(err)
		}
		files.forEach(file => {
			fs.unlinkSync(file);
 			return;
		});
		// console.log('Successfully merged!');

		res.download(`./pdf/${milis}.pdf`, function (err) {
			if (err) {
				console.log("Error");
				console.log(err);
			} else {
				fs.unlinkSync(`./pdf/${milis}.pdf`); //Delete local file 
				console.log("Success");
			}  
		});   

	});
	 
});

var server = app.listen('5000', function() {
    console.log('Express server listening on port 5000');
});
