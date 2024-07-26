document.addEventListener('DOMContentLoaded', function () {
    const levelSelect = document.getElementById('level');
    const themeButton = document.getElementById('theme-button');
    const themeElement = document.getElementById('theme');
    const exampleButton = document.getElementById('example-button');
    const exampleElement = document.getElementById('example');
    const timerSelect = document.getElementById('timer-select');
    const startButton = document.getElementById('start-button');
    const timerChartElement = document.getElementById('timer-chart');
    let data = [];
    let currentTheme = null;
    let timer;
    let timerChart;
    let totalTime;

    function loadExcelDataFromServer(filePath) {
        fetch(filePath)
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => {
                const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                data = XLSX.utils.sheet_to_json(worksheet);
                console.log("データが読み込まれました。", data); // デバッグ用ログ
                populateLevels();
            })
            .catch(error => console.error("エラーが発生しました。", error)); // エラーハンドリング
    }

    function populateLevels() {
        const levels = [...new Set(data.map(item => item.Level))];
        console.log("レベルが一意に抽出されました。", levels); // デバッグ用ログ
        levelSelect.innerHTML = ""; // 既存のオプションをクリア
        levels.forEach(level => {
            const option = document.createElement('option');
            option.value = level;
            option.textContent = level;
            levelSelect.appendChild(option);
        });
    }

    function showTheme() {
        const selectedLevel = levelSelect.value;
        const filteredThemes = data.filter(item => item.Level == selectedLevel).map(item => item.Theme);
        const themeIndex = Math.floor(Math.random() * filteredThemes.length);
        currentTheme = filteredThemes[themeIndex];
        themeElement.textContent = currentTheme;
    }

    function showExample() {
        if (exampleElement.classList.contains('hidden')) {
            if (!currentTheme) {
                alert('先にテーマを表示してください。');
                return;
            }
            const example = data.find(item => item.Theme === currentTheme).Example;
            exampleElement.textContent = example;
            exampleElement.classList.remove('hidden');
            exampleButton.textContent = '例を閉じる';
        } else {
            exampleElement.classList.add('hidden');
            exampleButton.textContent = '例を見る';
        }
    }

    function startTimer() {
        if (timer) {
            clearInterval(timer);
        }

        totalTime = parseInt(timerSelect.value, 10) * 60;
        let timeLeft = totalTime;

        const data = {
            labels: ['経過時間', '残り時間'],
            datasets: [{
                data: [0, totalTime],
                backgroundColor: ['#1e90ff', '#f0f8ff'],
                borderWidth: 0
            }]
        };

        const options = {
            cutout: '70%',
            rotation: -90,
            circumference: 360,
            tooltips: { enabled: false },
            animation: { animateRotate: true, animateScale: false },
            responsive: true,
            maintainAspectRatio: false
        };

        if (timerChart) {
            timerChart.destroy();
        }

        timerChart = new Chart(timerChartElement, {
            type: 'doughnut',
            data: data,
            options: options
        });

        timer = setInterval(() => {
            timeLeft--;
            const elapsedTime = totalTime - timeLeft;

            timerChart.data.datasets[0].data[0] = elapsedTime;
            timerChart.data.datasets[0].data[1] = timeLeft;
            timerChart.update();

            if (timeLeft <= 0) {
                clearInterval(timer);
                alert('時間切れです。');
            }
        }, 1000);
    }

    themeButton.addEventListener('click', showTheme);
    startButton.addEventListener('click', startTimer);
    exampleButton.addEventListener('click', showExample);

    // サーバーからファイルをロード
    loadExcelDataFromServer('excel/shuwa_exam_question_list.xlsx');
});

