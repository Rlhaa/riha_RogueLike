import chalk from 'chalk';
import figlet from 'figlet';
import readlineSync from 'readline-sync';
import {startGame} from "./game.js";

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


// 로비 화면을 출력하는 함수
export async function displayLobby() {
    console.clear();

    // 타이틀 텍스트
    console.log(
        chalk.cyan(
            figlet.textSync('RL- Javascript', {
                font: 'Standard',
                horizontalLayout: 'default',
                verticalLayout: 'default'
            })
        )
    );

    // 상단 경계선
    const line = chalk.magentaBright('='.repeat(50));
    console.log(line);

    // 게임 이름
    console.log(chalk.yellowBright.bold('CLI 게임에 오신것을 환영합니다!'));

    // 설명 텍스트
    console.log(chalk.green('옵션을 선택해주세요.'));
    console.log();

    // 옵션들
    console.log(chalk.blue('1.') + chalk.white(' 새로운 게임 시작'));
    console.log(chalk.blue('2.') + chalk.white(' 업적'));
    console.log(chalk.blue('3.') + chalk.white(' 종료'));

    // 하단 경계선
    console.log(line);

    // 하단 설명
    console.log(chalk.gray('1-4 사이의 수를 입력한 뒤 엔터를 누르세요.'));
}

// 유저 입력을 받아 처리하는 함수
export function handleUserInput() {
    const choice = readlineSync.question('입력: ');

    switch (choice) {
        case '1':
            {
            console.log(chalk.green('게임을 시작합니다.'));
            // 여기에서 새로운 게임 시작 로직을 구현
            const reportData = loadReport();
            startGame(reportData);
            }
            break;
        case '2':
            {
            console.log(chalk.yellow('누적 기록.'));
            // 업적 확인하기 로직을 구현
            const reportData = loadReport();
            printReport(reportData);
            handleUserInput();
            }
            break;
        case '3':
            console.log(chalk.red('게임을 종료합니다.'));
            // 게임 종료 로직을 구현
            process.exit(0); // 게임 종료
            break;
        default:
            console.log(chalk.red('올바른 선택을 하세요.'));
            handleUserInput(); // 유효하지 않은 입력일 경우 다시 입력 받음
    }
}

// 게임 시작 함수
function start() {
    displayLobby();
    handleUserInput();
}

// 게임 실행
start();

export function loadReport() {
    const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  
  const reportPath = path.join(__dirname, 'reports', 'total_report.json');
  // 경로 생성 함수

  if (!fs.existsSync(reportPath)) {
    // 기록이 없으면
    console.log(chalk.red(`기록이 없습니다.`));
    return null;
  }
  
    const data = fs.readFileSync(reportPath, 'utf-8');
    const reportData = JSON.parse(data);
    return reportData;
}

function printReport(reportData) {
    if (!reportData) {
        console.log(chalk.red(`기록이 없습니다.`));
        return;
    } 
    console.log(chalk.yellowBright(`=== 게임 기록 ===`));
    console.log(`마지막 클리어 스테이지: ${reportData.clearStage}`);
    console.log(`총 게임 횟수: ${reportData.totalTry}`);
    console.log(`게임 클리어 : ${reportData.allClears}`);
    console.log(`클리어 실패 : ${reportData.totalFails}`);
    console.log(`===================`);
}

