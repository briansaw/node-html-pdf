# node-html-pdf

### Add Html for PDF file
Copy template/page_01 to template/page_xx

### Edit Html for PDF file
template/page_xx

### Modify index.js
.

.

data.data.jobs.created_at = await convertDate(data.data.jobs.created_at)

data.data.jobs.date_xxx = await convertDate(data.data.jobs.date_xxx); // new line

.


.

.

await createPDF(req.body, milis, 'th', '02', true);

await createPDF(req.body, milis, 'th', 'xx', true); // new line

.


Remark: createPDF(data.json, miliseconds, language='th', num_of_page='xx', landscape_status='true or false')


### Run
npm install

npm start

### Postman
Url: localhost:5000/download

Headers: [{"key":"Content-Type","value":"application/json","description":""}]

Body: json_test/body.json
