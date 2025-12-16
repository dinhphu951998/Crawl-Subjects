
function getImpSubjects(impCode = "im01") {
    const items = { ... localStorage };
    const values = Object.values(items).map(item => JSON.parse(item));

    console.log("Total subjects: " + values.length);

    const impSubjects = values.filter(s => s.subjectDetails.some(sd => sd.group.toLowerCase().includes(impCode)));

    console.log("Total imp subjects: " + impSubjects.length);

    return impSubjects.map(s => {return {code: s.code, name: s.name, credit: s.credit, ...s.subjectDetails.find(sd => sd.group.toLowerCase().includes(impCode))}}).sort((a, b) => a.code.localeCompare(b.code));
}

function getAdditionalData(additionalRow) {
    const table = $(additionalRow).find('table')
    const rows = $(table).find('tr')
    if (rows.length == 2) {
        const cells = $(rows).eq(1).find('td')
        const dayOfWeek = $(cells).eq(0).text().trim()
        const slot = $(cells).eq(1).text().replace(/[\r\n\t]/g, ' ').replace(/\s+/g, ' ').trim()
        const room = $(cells).eq(2).text().trim()
        const branch = $(cells).eq(3).text().trim()
        const weeks = $(cells).eq(4).text().replace(/[\r\n\t]/g, ' ').replace(/\s+/g, ' ').trim()
        
        return {
            dayOfWeek,
            slot,
            room,
            branch,
            weeks,
        }
    }
    return {};
}

async function fetchSubjectTable(id) {
    const response = await fetch("https://mybk.hcmut.edu.vn/dkmh/getThongTinNhomLopMonHoc.action", {
        "headers": {
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          "x-requested-with": "XMLHttpRequest",
        },
        "body": "monHocId=" + id,
        "method": "POST"
      });
    const text = await response.text();
    return text;
}

async function getSubjectTable(subject, id, waitTime) {
    // subject.click();
    // await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
    // let table = $('#tkbLT' + id);

    const tableHtml = await fetchSubjectTable(id);
    
    await new Promise(resolve => setTimeout(resolve, waitTime * 1000));

    const rows = $(tableHtml).find('tr');
    const subjectDetails = []
    for (const row of rows) {
        if ($(row).find('table').length != 0 || $(row).find('td').length != 9) {
            continue;
        }
        const cells = $(row).find('td')
        const group = $(cells).eq(0).text().trim()
        const size = $(cells).eq(1).text().trim()
        const language = $(cells).eq(2).text().trim()
        const teacher = $(cells).eq(4).text().trim().replace(/"/g, '')
        let detail = {
            group,
            size,
            language,
            teacher,
        }

        // Get the next row (if any)
        const nextRow = $(row).next();
        if (nextRow && $(nextRow).find('table').length != 0) {
            detail = {...detail, ...getAdditionalData(nextRow)}
        } else {
            console.log("No more additional data")
        }
        subjectDetails.push(detail)
    }
    // subject.click();
    console.log("Subject details: "+ subjectDetails.length)
    return subjectDetails
}

function saveToLocalStorage(id, data) {
    localStorage.setItem("subjectData_" + id, JSON.stringify(data))
}

function isValidToCrawl(id) {
    const data = localStorage.getItem("subjectData_" + id)
    if (data) {
        const dataObj = JSON.parse(data)
        return dataObj.subjectDetails.length == 0
    }
    return true
}

async function crawlSubjects(subjects, waitTime = 2, batchIndex = 0, forceUpdate = false) {
    for (let i = 0; i < subjects.length; i++) {
        const subject = subjects[i]
        const id = subject.id.split('monHoc')[1].trim()
        const code = $(subject).find('.item_list:nth-child(3)').text().trim()
        const name = $(subject).find('.item_list:nth-child(4)').text().trim()
        const credit = $(subject).find('.item_list:nth-child(5)').text().trim()

        if (!forceUpdate && !isValidToCrawl(id)) {
            continue
        }

        console.log(`Batch ${batchIndex}: [${i}/${subjects.length}] Crawling subject: ${id} - ${code} - ${name}`)

        const subjectDetails = await getSubjectTable(subject, id, waitTime)
        
        const data = {
            code,
            name,
            credit,
            subjectDetails,
        }
        saveToLocalStorage(id, data)
    }
    console.log(`Batch ${batchIndex} completed`)
}

async function startCrawling(options = {}) {
    let {
        waitTime = 2,
        batchSize = 400,
        forceUpdate = false,
        subjects,
        count: limit
    } = options;
    
    let allSubjects = $("[id*='monHoc']");
    if (subjects) {
        allSubjects = subjects;
    }
    if (limit) {
        allSubjects = allSubjects.slice(0, limit);
    }
    
    let tasks = [];
    for (let i = 0; i < Math.ceil(allSubjects.length / batchSize); i++) {
        const batch = allSubjects.slice(i * batchSize, (i + 1) * batchSize);
        tasks.push(crawlSubjects(batch, waitTime, i, forceUpdate));
    }
    await Promise.all(tasks);
    console.log("COMPLETED!");
}

// Example usage:
// startCrawling({ waitTime: 1, batchSize: 50, forceUpdate: true });
startCrawling({ waitTime: 1, batchSize: 50, forceUpdate: true });
