let csvData = [];

// Load csv
fetch('data.csv')
    .then(response => response.text())
    .then(text => {
        csvData = parseCSV(text);
    })
    .catch(error => {
        console.error('Error loading CSV file:', error);
    });

function parseCSV(text) {
    const rows = text.split('\n');
    return rows.map(row => row.split(','));
}

function searchCSV() {
    const year = document.getElementById('searchInputX').value;
    const question = document.getElementById('searchInputY').value;
    const resultTable = document.getElementById('resultTable');
    const tbody = resultTable.querySelector('tbody');
    tbody.innerHTML = '';
    line = String(csvData[question]);
    ans = line.split(',');
    output = ans[year-1976];
    
    if (year < 2012){
        exam_type = "HKCEE"
    } else {
        exam_type = "HKDSE"
    }

    if (["A", "B", "C", "D", "E"].includes(output)){
        tbody.innerHTML = '<tr><td colspan="100%">'+ exam_type + " " + year + "年第" + question + "題答案: " + output + "</td></tr>";
    } else {
        tbody.innerHTML = '<tr><td colspan="100%">沒有找到匹配的結果</td></tr>';
    }
    
}
