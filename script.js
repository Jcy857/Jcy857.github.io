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

function getColumn(data, colIndex) {
    return data.map(row => row[colIndex]); 
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

function check_answer() {
    const year = document.getElementById('searchInputX').value;
    
    // Check if the year is within the supported range 
    if (year < 2012 || year > 2024) {
        alert(`The year entered "${year}" is not supported. Please enter a year between 2012 and 2024.`);
        return;
    }    
    
    
    const answers = [];
    const forms = document.querySelectorAll('.ans_box');
    forms.forEach((form, index) => {
        const select = form.querySelector('select');
        const answer = select.value;
        answers.push(answer); 
    });

    let number_of_correct_answer = 0; 
    let number_of_wrong_answer = 0;
    const yearIndex = year - 1976;
    const correctAnswersColumn = getColumn(csvData, yearIndex);
    const correct_answers = String(correctAnswersColumn).split(",").slice(1,46);

    for (let i=0; i<45; i++) {
        if (answers[i] === correct_answers[i]) {
            number_of_correct_answer += 1;
        } else {
            number_of_wrong_answer += 1;
        }
    }

    correct_pc = number_of_correct_answer / 45 * 100;
    incorrect_pc = number_of_wrong_answer / 45 * 100;
    alert(`
        Correct        : ${number_of_correct_answer}/45\n
        Incorrect     : ${number_of_wrong_answer}/45\n
        Correct %   : ${correct_pc.toFixed(2)}%\n
    `);

    correct_answers.forEach((answer, index) => { 
        const resultContainer = document.getElementById(`result${index + 1}`);
        resultContainer.innerHTML = '';    
        const p = document.createElement('p'); 
        p.textContent = `第${index + 1}題答案: ${answer}`; 
        p.classList.add('answer-item');
        if (index === 30) { 
            p.classList.add('extra-spacing'); 
        }
        resultContainer.appendChild(p); 
    });

    const selectBoxes = document.querySelectorAll('.ans');
    selectBoxes.forEach(selectBox => 
        { 
            selectBox.disabled = true; 
        }
    );
}
