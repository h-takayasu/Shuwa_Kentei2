// script.js
// グローバル変数でshuwaシートのデータを保持
let shuwaData = [];
// グローバル変数としてカウントダウンインターバルを保持
let countdownInterval;
let usedQuestions = []; // 出題済みの問題を保持するグローバル変数

// 実技・筆記ボタンを押したときの要素の表示をリセットする関数
// 実技・筆記ボタンを押したときの要素の表示をリセットする関数
function resetView() {
    // 「開始！」ボタンを非表示
    const startButton = document.getElementById('start-button');
    if (startButton) {
        startButton.style.display = 'none';
        console.log('start-button hidden');
    }

    // 問題コンテナを非表示
    const questionContainer = document.getElementById('question-container');
    if (questionContainer) {
        questionContainer.style.display = 'none';
        console.log('question-container hidden');
    }

    // カウントダウン開始ボタンを非表示
    const startCountdownButton = document.getElementById('start-countdown-button');
    if (startCountdownButton) {
        startCountdownButton.style.display = 'none';
        console.log('start-countdown-button hidden');
    }

    // 次の問題へ進むボタンを非表示
    const nextQuestionButton = document.getElementById('next-question-button');
    if (nextQuestionButton) {
        nextQuestionButton.style.display = 'none';
        console.log('next-question-button hidden');
    }

    // キャンセルボタンを非表示
    const cancelCountdownButton = document.getElementById('cancel-countdown-button');
    if (cancelCountdownButton) {
        cancelCountdownButton.style.display = 'none';
        console.log('cancel-countdown-button hidden');
    }

    // カウントダウンタイマー（キャンバス）を非表示
    const countdownTimer = document.getElementById('countdown-timer');
    if (countdownTimer) {
        countdownTimer.style.display = 'none';
        console.log('countdown-timer hidden');
    }
}

// 特定のクラスを持つ要素をすべて非表示にするヘルパー関数
function hideElementsByClass(className) {
    const elements = document.querySelectorAll(`.${className}`);
    elements.forEach(element => {
        element.style.display = 'none';
        console.log(`${className} hidden`); // ログを表示
    });

    // 要素が存在しない場合のデバッグメッセージ
    if (elements.length === 0) {
        console.log(`No elements found with class ${className}`);
    }
}

function showImage(type) {
    const handImage = document.getElementById('hand-image');
    const pencilImage = document.getElementById('pencil-image');

    if (type === 'jitsugi') {
        pencilImage.classList.add('hidden');  // 筆記画像をフェードアウト
        handImage.classList.remove('hidden'); // 実技画像を表示
    } else if (type === 'hikki') {
        handImage.classList.add('hidden');    // 実技画像をフェードアウト
        pencilImage.classList.remove('hidden'); // 筆記画像を表示
    } else {
        handImage.classList.remove('hidden'); // 両方の画像を表示
        pencilImage.classList.remove('hidden');
    }
}

// Excelファイルを読み込んでドロップダウンを設定する関数
// Excelファイルを読み込んでドロップダウンを設定する関数
async function loadExcelData(sheetName) {
    try {
        const response = await fetch('excel/shuwa_exam_question_list_ver0.02.xlsx'); // Excelファイルのパスを指定
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });

        const sheet = workbook.Sheets[sheetName]; // 指定されたシートを読み込む
        const data = XLSX.utils.sheet_to_json(sheet);

        if (sheetName === 'shuwa') {
            shuwaData = data; // 実技データを格納
        } else if (sheetName === 'writing') {
            shuwaData = data; // 筆記データを格納
        }

        // ドロップダウンを設定
        populateDropdown('year-select', data, 'Year');
        populateDropdown('level-select', data, 'Level');
        populateDropdown('type-select', data, 'Type');

        console.log(sheetName + 'のデータをロードしました。');

        // データをロードした後にドロップダウンをフェードイン
        showDropdownContainer();
        // 初回読み込み時に年度のドロップダウンを設定
        populateDropdown('year-select', data, 'Year');
        setDropdownBehavior(data); // ドロップダウンの動作を設定

    } catch (error) {
        console.error('Excelファイルの読み込み中にエラーが発生しました:', error);
    }
}


// ドロップダウンを設定する関数
function populateDropdown(elementId, data, key) {
    const selectElement = document.getElementById(elementId);
    selectElement.innerHTML = '<option value="">選択してください</option>'; // 初期化
    const uniqueValues = [...new Set(data.map(item => item[key]))];

    uniqueValues.forEach(value => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        selectElement.appendChild(option);
    });
}

// ドロップダウンの連動と動作を設定する関数
// ドロップダウンの連動と動作を設定する関数
function setDropdownBehavior(data) {
    const yearSelect = document.getElementById('year-select');
    const levelSelect = document.getElementById('level-select');
    const typeSelect = document.getElementById('type-select');
    const startButton = document.getElementById('start-button');

    // 初期状態では「出題レベル」と「出題タイプ」を無効化
    levelSelect.disabled = true;
    typeSelect.disabled = true;
    console.log("setDropdownBehavior関数が呼び出されました");

    // 年度選択時の動作
    yearSelect.addEventListener('change', function() {
        const selectedYear = this.value;
        console.log('年度が選択されました: ' + selectedYear);

        if (selectedYear) {
            levelSelect.disabled = false; // 年度が選択されたらレベル選択を有効化
            const filteredData = data.filter(item => item.Year == selectedYear); // 選択された年度に基づくフィルタリング
            console.log('フィルタリング後のデータ（レベル）:', filteredData); // デバッグ用のメッセージ
            populateDropdown('level-select', filteredData, 'Level'); // レベルのドロップダウンを設定
        } else {
            levelSelect.disabled = true; // 年度が未選択の場合は無効化
            levelSelect.innerHTML = '<option value="">選択してください</option>';
            typeSelect.disabled = true; // タイプも無効化
            typeSelect.innerHTML = '<option value="">選択してください</option>';
        }
        typeSelect.disabled = true; // レベル選択後までタイプは無効化
        typeSelect.innerHTML = '<option value="">選択してください</option>';

        checkAllSelected(); // すべての選択状態をチェックしてボタン表示の制御
    });

    // レベル選択時の動作
    levelSelect.addEventListener('change', function() {
        const selectedYear = yearSelect.value; // 選択された年度
        const selectedLevel = this.value;
        console.log('レベルが選択されました: ' + selectedLevel);

        if (selectedLevel) {
            typeSelect.disabled = false; // レベルが選択されたらタイプ選択を有効化
            const filteredData = data.filter(item => item.Year == selectedYear && item.Level == selectedLevel); // 選択された年度とレベルに基づくフィルタリング
            console.log('フィルタリング後のデータ（タイプ）:', filteredData); // デバッグ用のメッセージ
            populateDropdown('type-select', filteredData, 'Type'); // タイプのドロップダウンを設定
        } else {
            typeSelect.disabled = true; // レベルが未選択の場合は無効化
            typeSelect.innerHTML = '<option value="">選択してください</option>';
        }

        checkAllSelected(); // すべての選択状態をチェックしてボタン表示の制御
    });

    // タイプ選択時の動作
    typeSelect.addEventListener('change', function() {
        checkAllSelected(); // すべての選択状態をチェックしてボタン表示の制御
    });

    // すべての選択状態をチェックする関数
    function checkAllSelected() {
        if (yearSelect.value && levelSelect.value && typeSelect.value) {
            startButton.style.display = 'block'; // すべて選択されていれば「開始！」ボタンを表示
        } else {
            startButton.style.display = 'none'; // いずれかが未選択なら非表示
        }
    }
}

// ドロップダウンを設定する関数
function populateDropdown(elementId, data, key) {
    const selectElement = document.getElementById(elementId);
    selectElement.innerHTML = '<option value="">選択してください</option>'; // 初期化

    const uniqueValues = [...new Set(data.map(item => item[key]))];
    console.log('ドロップダウンに設定される値 (' + key + '):', uniqueValues); // デバッグ用のメッセージ

    uniqueValues.forEach(value => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        selectElement.appendChild(option);
    });
}

// ドロップダウンを表示する関数
function showDropdownContainer() {
    const dropdownContainer = document.getElementById('dropdown-container');
    dropdownContainer.classList.add('show'); // クラスを追加してフェードイン
    console.log('ドロップダウンメニューがフェードインで表示されました。');
}

// ボタンがクリックされたときにドロップダウンを表示し、データを設定する関数
function showDropdowns(sheetName) {
    console.log('showDropdowns関数が呼び出されました。');
    loadExcelData(sheetName); // Excelデータを読み込む

    // データがロードされてから表示のリセットを実行
    setTimeout(() => resetView(), 100); // 少し遅延させて実行
}

// ページ読み込み時には何もしない
window.onload = () => {
    console.log('ページがロードされました。');
};


// 「開始！」ボタンのクリックイベントで問題を表示
document.getElementById('start-button').addEventListener('click', function() {
    // 問題表示エリアを表示
    const questionContainer = document.getElementById('question-container');
    questionContainer.style.display = 'block';

    // 問題を表示する（Typeによって処理を分ける）
    displayQuestion();
});

// function displayQuestion() {
//     const questionContent = document.getElementById('question-content');
//     const startCountdownButton = document.getElementById('start-countdown-button');
//     const nextQuestionButton = document.getElementById('next-question-button');

//     // shuwaシートのデータをフィルタリングして取得（仮のデータを使用）
//     const filteredData = filterDataBySelection(); // 選択肢に基づいてデータをフィルタリング

//     if (filteredData.length === 0) {
//         questionContent.innerText = '選択された条件に一致する問題がありません。';
//         return;
//     }

//     // ランダムな問題を選択
//     const randomQuestion = filteredData[Math.floor(Math.random() * filteredData.length)];

//     // Typeが'Speech'の場合の処理
//     if (randomQuestion.Type === 'Speech') {
//         console.log('スピーチ判定に成功')
//         if (randomQuestion.Theme) {  // Themeプロパティが存在するかを確認
//             questionContent.innerText = randomQuestion.Theme; // Themeを表示
//         } else {
//             console.error('Themeプロパティが見つかりません'); // エラーログ
//             return;
//         }
//         startCountdownButton.style.display = 'block'; // カウントダウン開始ボタンを表示

//         // カウントダウン開始ボタンのクリックイベントを一度だけ追加
//         startCountdownButton.onclick = function() {
//             startCountdownButton.style.display = 'none'; // ボタンを非表示
//             startCountdown(); // カウントダウンを開始
//         };
//     }

//     // 次の問題へ進むボタンのクリックイベントを一度だけ追加
//     nextQuestionButton.onclick = function() {
//         nextQuestionButton.style.display = 'none'; // 次の問題へ進むボタンを非表示
//         cancelCountdownButton.style.display = 'none'; // キャンセルボタンを非表示
//         // 次の問題を表示するロジックをここに追加
//         console.log('次の問題へ進む');
//     };
// }

// 選択された条件に基づいてshuwaシートのデータをフィルタリングする関数
function filterDataBySelection() {
    const yearSelect = document.getElementById('year-select').value;
    const levelSelect = document.getElementById('level-select').value;
    const typeSelect = document.getElementById('type-select').value;

    // shuwaData変数からデータをフィルタリング
    const filteredData = shuwaData.filter(item => 
        item.Year == yearSelect && 
        item.Level == levelSelect && 
        item.Type == typeSelect
    );

    console.log('フィルタリングされたデータ:', filteredData); // デバッグ用のメッセージ

    return filteredData;
}

function startNextQuestion() {
    displayQuestion(); // 未出題の問題を表示
}

function displayQuestion() {
    const questionContent = document.getElementById('question-content');
    const startCountdownButton = document.getElementById('start-countdown-button');
    const nextQuestionButton = document.getElementById('next-question-button');
    const cancelCountdownButton = document.getElementById('cancel-countdown-button'); // キャンセルボタン

    // shuwaシートのデータをフィルタリングして取得
    const filteredData = filterDataBySelection(); // 選択肢に基づいてデータをフィルタリング

    if (filteredData.length === 0) {
        questionContent.innerText = '選択された条件に一致する問題がありません。';
        return;
    }

    // 出題済みの問題を除外した未出題の問題を取得
    const remainingQuestions = filteredData.filter(q => !usedQuestions.includes(q));

    if (remainingQuestions.length === 0) {
        questionContent.innerText = 'すべての問題が出題されました。お疲れ様でした！';
        nextQuestionButton.style.display = 'none'; // 次の問題へ進むボタンを非表示
        return;
    }

    // ランダムな問題を選択
    const randomQuestion = remainingQuestions[Math.floor(Math.random() * remainingQuestions.length)];
    console.log(randomQuestion); // デバッグ用: 選ばれた問題を表示

    // 問題を出題済みリストに追加
    usedQuestions.push(randomQuestion);

    
    // Typeが'Speech'の場合の処理
    if (randomQuestion.Type === 'Speech') {
        if (randomQuestion.Theme) {  // Themeプロパティが存在するかを確認
            questionContent.innerText = randomQuestion.Theme; // Themeを表示
        } else {
            console.error('Themeプロパティが見つかりません'); // エラーログ
            return;
        }
        startCountdownButton.style.display = 'block'; // カウントダウン開始ボタンを表示

        // カウントダウン開始ボタンのクリックイベントを一度だけ追加
        startCountdownButton.onclick = function() {
            startCountdownButton.style.display = 'none'; // ボタンを非表示
            startCountdown(); // カウントダウンを開始
        };
    } else if (randomQuestion.Type === 'four-choices') {
        // 'four-choices' の場合の処理
        questionContent.innerHTML = ''; // 以前のコンテンツをクリア
    
        // Questionを表示
        const questionTitle = document.createElement('h3');
        questionTitle.textContent = randomQuestion.Question;
        questionContent.appendChild(questionTitle);
    
        // Optionsをラジオボタンで表示
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'options-container';
    
        // オプションを改行コードで分割
        randomQuestion.Option.split('\n').forEach((option, index) => {
            const optionWrapper = document.createElement('div');
    
            const radioInput = document.createElement('input');
            radioInput.type = 'radio';
            radioInput.name = 'options';
            radioInput.value = index;
            radioInput.id = `option${index}`;
    
            const radioLabel = document.createElement('label');
            radioLabel.htmlFor = `option${index}`;
            radioLabel.textContent = option;
    
            optionWrapper.appendChild(radioInput);
            optionWrapper.appendChild(radioLabel);
            optionsContainer.appendChild(optionWrapper);
        });
    
        questionContent.appendChild(optionsContainer);
    
        // 回答ボタンを作成
        const answerButton = document.createElement('button');
        answerButton.textContent = '回答する';
        answerButton.className = 'answer-button';
        questionContent.appendChild(answerButton);
    
        // 解説表示エリアを作成
        const explanationContainer = document.createElement('div');
        explanationContainer.className = 'explanation-container';
        questionContent.appendChild(explanationContainer);
    
        // 回答ボタンクリックイベント
        answerButton.onclick = function() {
            const selectedOption = document.querySelector('input[name="options"]:checked');
            if (!selectedOption) {
                alert('選択肢を選んでください。');
                return;
            }
            console.log(randomQuestion)
            const selectedValue = parseInt(selectedOption.value);
            const correctAnswer = parseInt(randomQuestion.Answer);
    
            // 正否判定
            if (selectedValue+1 === correctAnswer) {
                explanationContainer.innerHTML = '<p style="color: green;">正解です！</p>';
            } else {
                explanationContainer.innerHTML = '<p style="color: red;">不正解です。</p>';
            }
    
            // 解説を表示
            const explanation = document.createElement('p');
            explanation.textContent = randomQuestion.Detail;
            explanationContainer.appendChild(explanation);

            // 「次の問題へ進む」ボタンを表示
            nextQuestionButton.style.display = 'block';
        };
    } else if (randomQuestion.Type === 'options') {
        // 'options' の場合の処理
        questionContent.innerHTML = ''; // 以前のコンテンツをクリア
    
        // 文章から「ア, イ, ウ, エ, オ」を検出
        const matches = [...randomQuestion.Question.matchAll(/[ア-オ]/g)]; // 正規表現でアイウエオを検出
        const uniqueMatches = [...new Set(matches.map(match => match[0]))]; // 重複を除去してユニークに
    
        if (uniqueMatches.length === 0) {
            questionContent.innerHTML = '<p>問題文に「ア, イ, ウ, エ, オ」が見つかりませんでした。</p>';
            return;
        }
    
        questionContent.innerHTML = `<p>${randomQuestion.Question}</p>`; // 問題文を表示
    
        // オプションの選択肢を作成
        const optionItems = randomQuestion.Option.split('\n'); // Optionを改行で分割
    
        // 選択肢エリアを作成
        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'options-container';
    
        uniqueMatches.forEach((match, index) => {
            const select = document.createElement('select');
            select.className = 'option-select';
            select.name = `select${index}`;
            select.innerHTML = `<option value="">選択してください (${match})</option>`; // 各選択肢にマッチ文字を表示
            
            // 各オプションを追加
            optionItems.forEach(opt => {
                const optionElement = document.createElement('option');
                optionElement.value = opt.trim();
                optionElement.textContent = opt.trim();
                select.appendChild(optionElement);
            });
    
            optionsContainer.appendChild(select);
        });
    
        questionContent.appendChild(optionsContainer);
    
        // 回答ボタンを作成
        const answerButton = document.createElement('button');
        answerButton.textContent = '回答する';
        answerButton.className = 'answer-button';
        questionContent.appendChild(answerButton);
    
        // 解説表示エリアを作成
        const explanationContainer = document.createElement('div');
        explanationContainer.className = 'explanation-container';
        questionContent.appendChild(explanationContainer);
    
        // 回答ボタンクリックイベント
        answerButton.onclick = function() {
            // 選択されたオプションの値を収集し、数字部分のみを順番に結合
            let selectedOptions = [];
            uniqueMatches.forEach((match, index) => {
                const select = document.querySelector(`select[name="select${index}"]`);
                if (select && select.value) {
                    // .前の数字部分を抽出
                    const numericPart = select.value.split('.')[0].trim();
                    selectedOptions.push(numericPart);
                }
            });
    
            if (selectedOptions.length !== uniqueMatches.length) {
                alert('すべての選択肢を選んでください。');
                return;
            }
    
            const selectedString = selectedOptions.join(',');
    
            // 答えと比較
            if (selectedString === randomQuestion.Answer) {
                explanationContainer.innerHTML = '<p style="color: green;">正解です！</p>';
            } else {
                explanationContainer.innerHTML = '<p style="color: red;">不正解です。</p>';
            }
    
            // 解説を表示
            const explanation = document.createElement('p');
            explanation.textContent = randomQuestion.Detail;
            explanationContainer.appendChild(explanation);
            // 「次の問題へ進む」ボタンを表示
            nextQuestionButton.style.display = 'block';
        };
    }
    // 次の問題へ進むボタンのクリックイベントを一度だけ追加
    nextQuestionButton.onclick = function() {
        nextQuestionButton.style.display = 'none'; // 次の問題へ進むボタンを非表示
        cancelCountdownButton.style.display = 'none'; // キャンセルボタンを非表示
        startCountdownButton.style.display = 'none'; // カウントダウン開始ボタンを非表示
        startCountdownButton.onclick = null; // クリックイベントの解除
        startNextQuestion(); // 次の問題を表示
    };
}


// カウントダウンタイマーの表示
function startCountdown() {
    const canvas = document.getElementById('countdown-timer');
    const cancelCountdownButton = document.getElementById('cancel-countdown-button');
    const nextQuestionButton = document.getElementById('next-question-button');
    canvas.style.display = 'block'; // 円グラフ表示
    cancelCountdownButton.style.display = 'block'; // キャンセルボタン表示


    const ctx = canvas.getContext('2d');
    const totalTime = 120; // 2分（120秒）
    let currentTime = totalTime;

    function drawCountdown() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // キャンバスをクリア
        ctx.beginPath();
        ctx.arc(100, 100, 90, 0, 2 * Math.PI); // 背景円
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 10;
        ctx.stroke();

        ctx.beginPath();
        const endAngle = (2 * Math.PI) * (currentTime / totalTime);
        ctx.arc(100, 100, 90, -0.5 * Math.PI, endAngle - 0.5 * Math.PI, false); // カウントダウン円
        ctx.strokeStyle = '#f8b400';
        ctx.lineWidth = 10;
        ctx.stroke();
    }

    drawCountdown(); // 初回描画

    countdownInterval = setInterval(function() {
        currentTime--;
        drawCountdown();

        if (currentTime <= 0) {
            clearInterval(countdownInterval);
            cancelCountdownButton.style.display = 'none'; // キャンセルボタンを非表示
            nextQuestionButton.style.display = 'block'; // 次の問題へ進むボタンを表示
        }
    }, 1000);

    // キャンセルボタンのクリックイベント
    cancelCountdownButton.onclick = function() {
        clearInterval(countdownInterval); // カウントダウンを停止
        canvas.style.display = 'none'; // 円グラフを非表示
        cancelCountdownButton.style.display = 'none'; // キャンセルボタンを非表示
        nextQuestionButton.style.display = 'block'; // 次の問題へ進むボタンを表示
    };
}