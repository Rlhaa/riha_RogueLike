import chalk from 'chalk';
import readlineSync from 'readline-sync';
import fs from 'fs';
import path from 'path';
import { handleUserInput } from './server.js';
import { displayLobby } from './server.js';
import { fileURLToPath } from 'url';


class Player {
  constructor() {
    this.maxHp = 300; // 플레이어 최대 체력
    this.hp = this.maxHp; // 현재 체력
    this.p_strong = 15; // 기본공격력
    this.defensive = 5; // 방어력
    this.dodge = 0.3; // 회피율
    this.reviveitem = false; // 부활서 소유 상태
  }
  // 어택메소드 안에서 기능할수있도록 매개변수 추가
  attack(monster, logs) {
    let min = this.p_strong;
    let max = min + 10;
    let p_damage = Math.floor(Math.random() * (max - min)) + min; // 20~30의 데미지중 랜덤 적용
    logs.push(`플레이어가 몬스터에게 ${p_damage - monster.defensive}의 피해를 주었습니다!`);
    monster.hp = monster.hp - p_damage - monster.defensive; // monster.hp -= p_damage;
    if (monster.hp < 0) {
      monster.hp = 0;
    }
  }

  revive() {
    if (this.hp <= 0 && this.reviveitem === true) {
      this.hp = this.maxHp;
      this.reviveitem = false;
      console.log('소유한 부활서가 사라지며 모든체력이 회복되고 재도전합니다.');
      readlineSync.question('아무키나 입력하세요.');
    }
  }

  skill(monster, logs) {
    let min = this.p_strong + 20;
    let max = min + 10;
    let p_damage = Math.floor(Math.random() * (max - min)) + min; // 30~40의 데미지중 랜덤 적용
    logs.push(`플레이어가 몬스터에게 ${p_damage}의 강한 피해를 주었습니다!`);
    monster.hp = monster.hp - p_damage; // monster.hp -= p_damage;
  }

  healing(amount) {
    this.hp += amount;
    if (this.hp > this.maxHp) {
      // 플레이어 최대 체력
      this.hp = this.maxHp; // 현재 체력) {
    }
  }

  dodgeprob() {
    const randomvalue = Math.random();
    if (randomvalue <= this.dodge) {
      return true;
    } else {
      return false;
    }
  }

  
}

class Monster {
  // player, logs 붙인것처럼 매개변수 stage > stage에 따른 스텟 증가를 부여하기위해
  constructor(stage) {
    this.hp = 80 + 10 * stage; // 몬스터 HP
    this.m_strong = 10 + 2 * stage; // 몬스터 기본공격력
    this.defensive = 5;
    this.names = ['null', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
    if (stage === 10) {
      this.hp = 300;
      this.m_strong = 30;
    }
  }
  // 어택메소드 안에서 기능할수있도록 매개변수 추가
  attack(player, logs) {
    // 몬스터의 공격
    let min = this.m_strong;
    let max = min + 10;
    let m_damage = Math.floor(Math.random() * (max - min)) + min; // 15~25의 데미지중 랜덤 적용

    if (player.dodgeprob() === true) {
      logs.push(chalk.red(`\n몬스터가 공격합니다!`));
      logs.push(`몬스터의 공격을 회피했습니다.`);
    } else {
      logs.push(chalk.red(`\n몬스터가 공격합니다!`));
      logs.push(chalk.red(`플레이어가 ${m_damage - player.defensive}의 피해를 받았습니다...`));
      player.hp = player.hp - m_damage - player.defensive; // Player.hp -= m_damage
      if (player.hp < 0) {
        player.hp = 0;
      }
    }
  }

  
}

class Item {
  constructor(name, explain, effect, prob) {
    this.name = name;
    this.explain = explain;
    this.effect = effect;
    this.prob = prob;
  }
  // 아이템 리스트에서 정해진 확률 (prob)에 따른 아이템 3개 등장, 이후 플레이어가 선택하여 적용
  itemchoice() {
    let itemarr = [];
    const item1 = new Item(
      '싸구려 회복 물약',
      '플레이어가 체력을 즉시 15 회복합니다.',
      (player) => {
        player.healing(15);
      },
      0.2,
    );
    const item2 = new Item(
      '쓸만한 체력 회복 물약',
      '플레이어가 체력을 즉시 30회복합니다.',
      (player) => {
        player.healing(30);
      },
      0.15,
    );
    const item3 = new Item(
      '고성능 체력 회복 물약',
      '플레이어가 체력을 즉시 45회복합니다.',
      (player) => {
        player.healing(45);
      },
      0.08,
    );
    const item9 = new Item(
      '[epic] 이계의 물약',
      '플레이어가 체력을 전부 회복합니다.',
      (player) => {
        player.healing(1000);
      },
      0.01,
    );
    const item4 = new Item(
      '무기 강화',
      '공격력을 5 증가시킵니다.',
      (player) => {
        player.p_strong += 5;
      },
      0.1,
    );
    const item5 = new Item(
      '[epic] 생명의 대가',
      '플레이어 체력을 40소모 하는 대신 공격력을 15 증가시킵니다.',
      (player) => {
        player.hp -= 40;
        player.p_strong += 15;
      },
      0.04,
    );
    const item6 = new Item(
      '재빠른 구두',
      '플레이어의 회피 확률이 5% 증가합니다.',
      (player) => {
        player.dodge += 0.05;
      },
      0.07,
    );
    const item7 = new Item(
      '[epic] 신비한 반지',
      '체력 20 회복, 공격력 10 증가, 회피율이 5% 증가합니다.',
      (player) => {
        player.hp += 20;
        player.p_strong += 10;
        player.dodge += 0.05;
      },
      0.04,
    );
    const item8 = new Item(
      '[epic] 강철 갑옷',
      '현재, 최대 체력이 20, 방어력이 3 증가합니다.',
      (player) => {
        player.maxHp += 20;
        player.healing(20);
        player.defensive += 3;
      },
      0.04,
    );
    const item10 = new Item(
      '[Mythic] 마법서',
      `"죽음에 달하는 피해를 입었을 때 플레이어가 모든 체력을 회복하고 스테이지에 재도전합니다. \n한개만 소유할 수 있습니다."`,
      (player) => {
        player.reviveitem = true;
      },
      0.01,
    );
    let list = [item1, item2, item3, item4, item5, item6, item7, item8, item9, item10];

    // 아이템 리스트 중 3개 선택해 배열 생성
    // c
    //   const random = Math.random();

    //   if (random < list[i].prob) {
    //       itemarr.push(list[i]);

    //   } else {
    //     trash.push(list[i]);
    //   }
    //   if (itemarr.length === 3) {
    //     break;
    //   }

    // }
    // 아이템 배열
    // const random = Math.random();
    // while(itemarr.length <= 3){
    while (true) {
      const random = Math.random();
      let randomchoice = Math.floor(Math.random() * list.length);
      let selecteditem = list[randomchoice];
      if (random <= selecteditem.prob) {
        itemarr.push(selecteditem);
      }
      if (itemarr.length >= 3) {
        break;
      }
    }
    return itemarr;
  }
}

//30 15 10 20 13 7  4  1

function displayStatus(stage, player, monster) {
  console.log(chalk.magentaBright(`\n=== Current Status ===`));
  console.log(
    chalk.cyanBright(`| Stage: ${stage} |`) +
      chalk.blueBright(
        `\n| 플레이어 | \n| HP : ${player.hp}/${player.maxHp} | 공격력 : ${
          player.p_strong
        } | 방어력 : ${player.defensive} | 회피율 : ${player.dodge * 100}% |`,
      ) +
      chalk.redBright(
        `\n| ${monster.names[stage]} | \n| HP : ${monster.hp} | 공격력 : ${monster.m_strong} | 방어력 : ${monster.defensive} |`,
      ),
  );
  console.log(chalk.magentaBright(`=====================\n`));
}

const battle = async (stage, player, monster) => {
  let logs = [];
  let turnEnd = false; // logs 배열 및 turnEnd 변수를 초기화.

  while (true) {
    console.clear();
    displayStatus(stage, player, monster); // 현재 상태 출력
    console.log(`스테이지 ${stage}: ${monster.names[stage]}이(가) 출현했습니다!`);
    logs.forEach((log) => console.log(log));

    const success = (0.51 - 0.05 * stage) * 100;
    const Success2 = Math.round(success);
    console.log(chalk.green(`\n1. 공격한다 2. 강공(35%) 3. 몰래 지나간다.(${Success2}%) `));
    const choice = readlineSync.question('당신의 선택은? ');

    logs.push(chalk.green(`\n${choice}를 선택하셨습니다.`));

    if (choice === '1') {
      player.attack(monster, logs);
      if (monster.hp > 0) {
        monster.attack(player, logs);
      }
    } else if (choice === '2') {
      if (Math.random() <= 0.35) {
        player.skill(monster, logs);
        if (monster.hp > 0) {
          monster.attack(player, logs);
        }
      } else {
        logs.push(chalk.red(`실패했습니다! 몬스터가 공격합니다!`));
        monster.attack(player, logs);
      }
    } else if (choice === '3') {
      if (Math.random() < 0.51 - 0.05 * stage) {
        logs.push(`무사히 지나갔습니다.`);
        logs.push(`\n| 스테이지 ${stage} 클리어! |`);
      readlineSync.question('다음 스테이지로 이동합니다. 아무 키나 입력하세요.');
      turnEnd = true; 
      break; //
      } else {
        logs.push(chalk.red(`실패했습니다! 몬스터가 공격합니다!`));
        monster.attack(player, logs);
      }
    }

    // 플레이어 HP 체크
    if (player.hp <= 0) {
      console.clear();
      displayStatus(stage, player, monster); 
      logs.push(chalk.red(`플레이어가 쓰러졌습니다!`));
      readlineSync.question('로비로 이동합니다. 아무 키나 입력하세요.');
      turnEnd = true; 
      break; 
    }

    
    if (monster.hp <= 0) {
      console.clear();
      displayStatus(stage, player, monster); 
      logs.push(`\n| 스테이지 ${stage} 클리어! |`);
      readlineSync.question('다음 스테이지로 이동합니다. 아무 키나 입력하세요.');

      await chooseItem(stage, player);

      turnEnd = true; 
      break; //
    }
  }
};

// 아이템 선택 함수
const chooseItem = async (stage, player) => {
  if (stage < 10) {
    console.clear();
    displayStatus(stage, player, new Monster(stage)); // 몬스터 상태는 필요 없지만, 현재 상태를 보여주기 위해 호출
    let itemChoices = new Item().itemchoice(); // 아이템 선택
    console.log(chalk.green(
      `\n1 : ${itemChoices[0].name} | ${itemChoices[0].explain} 
      \n2 : ${itemChoices[1].name} | ${itemChoices[1].explain} 
      \n3 : ${itemChoices[2].name} | ${itemChoices[2].explain}`
    ));

    while (true) {
      const choice2 = readlineSync.question('\n당신의 선택은? ');
      if (choice2 === '1') {
        itemChoices[0].effect(player);
        console.log(chalk.green(`\n${itemChoices[0].explain}`));
        break;
      } else if (choice2 === '2') {
        itemChoices[1].effect(player);
        console.log(chalk.green(`\n${itemChoices[1].explain}`));
        break;
      } else if (choice2 === '3') {
        itemChoices[2].effect(player);
        console.log(chalk.green(`\n${itemChoices[2].explain}`));
        break;
      } else {
        console.log(chalk.red(`\n정확히 입력해주세요.`));
      }
    }
  } 
};



let totalTry = 0; // 총 실행 횟수
let totalClears = 0; // 스테이지 클리어 수
let totalFails = 0; // 클리어 실패 수
let allClears = 0; // 10 스테이지 클리어 수

// () => {
//   const reportDir = path.join(__dirname, 'reports');
//   const reportData = {
//     totalTry,
//     totalClears,
//     totalFails,
//     allClears,
//   };
//   const reportPath = path.join(reportDir, 'total_report.json');

//   fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2), 'utf-8');
//   //fs.writeFileSync를 사용, reportPath에 reportData 객체를 JSON 형식으로 ㄱ기록
// };

export async function startGame(reportData) {
  console.clear(); // console.clear()를 호출하여 콘솔 화면 지우기
  const player = new Player(); // 플레이어 객체를 생성
  let stage = 1; // 스테이지를 1로 초기화
  let totalTry = reportData.totalTry; 
  let allClears = reportData.allClears; 
  let totalFails = reportData.totalFails;
  totalTry++;

  while (stage <= 10) {
    // 루프를 시작하여 최대 10단계까지 진행
    console.clear();
    const monster = new Monster(stage); // 현재 스테이지에 해당하는 몬스터 객체 생성
    const item = new Item();
    await battle(stage, player, monster, item); // 호출하여 전투를 시작

    // 플레이가 죽으면(player.hp가 0 이하가 되면) 게임종료
    if (player.hp <= 0) {
      console.log(`체력이 고갈되었습니다.`);
      if (player.reviveitem === true) {
        player.revive();
        continue;
      } else {
        totalFails++;
        report(totalTry, stage, allClears, totalFails);
        console.log(`게임 오버`);
        readlineSync.question('로비로 이동합니다. 아무키나 입력하세요.');
        displayLobby();
        handleUserInput();
        
      }
    } else if (stage === 10 && monster.hp <= 0) {
      console.log(`모든 스테이지를 클리어했습니다.`);
      allClears++;
      report(totalTry, stage, allClears, totalFails);
      readlineSync.question('로비로 이동합니다. 아무키나 입력하세요.');
      displayLobby();
      handleUserInput();
    }
    stage++;

    // 그 외 모든 상황은 스테이지 증가

    // 이후 10스테이지까지 루프 반복
  }
}



export async function report(totalTry, clearStage, allClears, totalFails) {

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const reportPath = path.join(__dirname, 'reports', 'total_report.json');

  const reportData = {
    totalTry: totalTry,
    clearStage: clearStage,
    allClears : allClears,
    totalFails : totalFails
  }
  const saveData = JSON.stringify(reportData, null, 2);

  try {
    fs.writeFileSync(reportPath, saveData, 'utf-8');
  } catch (err) { 
    console.error("err : ", err);
  }
 
}


