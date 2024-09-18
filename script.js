let csvData = [];

// 加載 CSV 文件
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
    const keyword_x = document.getElementById('searchInputX').value;
    const keyword_y = document.getElementById('searchInputY').value;
    const resultTable = document.getElementById('resultTable');
    const tbody = resultTable.querySelector('tbody');
    tbody.innerHTML = '';

    
    
    year = String(keyword_x);
    question = String(keyword_y);
    line = String(csvData[question]);
    ans = line.split(',');
    output = ans[year-1976];
    tbody.innerHTML = '<tr><td colspan="100%">沒有找到匹配的結果</td></tr>';
    tbody.innerHTML = '<tr><td colspan="100%">' + year + "年第" + question + "題答案: " + output + "</td></tr>";
}
