'use strict';

/*
 * Класс оружия
 */
class Weapon {
    constructor(imageSource, soundSource, speedShoot, razbros, strikesPerShoot) {
        this.setImage(imageSource); // Изображение оружия
        this.srcAudio = soundSource; // Звук оружия
        this.isActive = false; // Является выбранным?
        this.speedShot = speedShoot; // Скорострельность
        this.razbros = razbros; // Разброс
        this.strikesPerShoot = strikesPerShoot; // Количество пуль за выстрел
    }

    playSound() {
        this.audio = new Audio();
        this.audio.src = this.srcAudio;
        this.audio.play();
    }

    setImage(arg) {
        this.image = new Image();
        this.image.src = arg;
    }

    getImage() {
        return this.image;
    }

    strikes(x, y) {
        let array = [];
        let i;
        for(i = 0; i<this.strikesPerShoot; ++i) {
            array.push([
                x + getRandomInt(0 -  this.razbros/2, this.razbros/2),
                y + getRandomInt(0 -  this.razbros/2, this.razbros/2)
            ]);
        }
        return array;
    }

    draw(position) {
        context.beginPath();
        context.strokeStyle = "#1B1FFF";

        if (this.isActive === true) {
            context.fillStyle = "#ccc";
        } else {
            context.fillStyle = "#fff";
        }

        context.strokeRect(5+(165*position),5, 155, 85);
        context.fillRect(5+(165*position),5, 155, 85);
        context.drawImage(this.getImage(), 10+(165*position), 10);
        context.closePath();
    }
}

/*
 * Класс для хранения данных о статистике
 */
class Statistic {

    constructor() {
        this.hits = 0; // Попадания
        this.missed = 0; // Мимо
        this.money = 0; // Текущие деньги
    }

    addMoney(arg) {
        this.money += arg;
    }

    addMissed(arg) {
        this.missed += arg;
    }

    addHits(arg) {
        this.hits += arg;
    }
}

class Enemy {
    constructor() {
        this.x = 0; // Начальная координата x
        this.y = canvas.height/2 + getRandomInt(-200, 200);// Начальная координата y
        this.date = new Date();
        this.pastTime = this.date.getTime();
        this.colorBody = getRandomColor(); // Цвет тела
        this.colorEye = getRandomColor(); // Цвет глаз
    }

    draw() {
        this.go(); // Двигаем врага

        /*
         * Нарисуйте врага здесь
         */
        context.beginPath();
        // Тело
        context.fillStyle = this.colorBody;
        context.fillRect(this.x, this.y, 50, 50);
        // Глаза
        context.fillStyle = this.colorEye;
        context.fillRect(this.x+5, this.y+10, 15, 15);
        context.fillRect(this.x+25, this.y+10, 15, 15);

        context.closePath();
        ///////
    }

    go() {
        this.date = new Date();
        if (this.date.getTime()-this.pastTime >= 10) {
            this.x += 2.5; // Скорость движения к игроку
            this.y += getRandomInt(-1,1);
            if(this.y < 200) this.y = 200;
            if(this.y > canvas.height-200) this.y = canvas.height-200;
            if(this.x > canvas.width - 300) this.x = canvas.width - 300; // Не даем уйти за границу к игроку
            this.pastTime = this.date.getTime();
        }
    }

    // Попали ли по врагу
    isHit(x, y) {
        if( (x < this.x+50) && (x > this.x) ) {
            if( (y < this.y+50) && (y > this.y) ) {
                return true;
            }
        }

        return false;
    }

    // Может ли укусить игрока
    isBite() {
        return this.x > (canvas.width - 400);
    }
}

/*
 * Класс игрока
 */

class Player {
    constructor() {
        this.stat = new Statistic();
        this.health = 100; // Начальное здоровье
        this.maxHealth = 100; // Мкс. здоровья
        this.x = canvas.width - 200; // Положение на холсте
        this.y = canvas.height/2;
    }

    /*
     * Отрисовка игрока
     */

    draw() {
        context.beginPath();
        // Отображаем здоровье
        context.strokeStyle = "#FFF";
        context.font = 'bold 30px sans-serif';
        context.strokeText(this.health+'/'+this.maxHealth, this.x, this.y+200);
        //Голова
        context.fillStyle = "#FFFFFF";
        context.fillRect(this.x, this.y, 50, 50);
        // Глаза
        context.fillStyle = "#000";
        context.fillRect(this.x+5, this.y+10, 15, 15);
        context.fillRect(this.x+25, this.y+10, 15, 15);
        // Телов и руки
        context.fillStyle = "#88FF22";
        context.fillRect(this.x+10, this.y+50, 30, 70);
        context.fillStyle = "#225F22";
        context.fillRect(this.x-20, this.y+70, 20, 20);
        context.fillRect(this.x+10, this.y+70, 20, 20);
        // Оружие
        context.fillStyle = "#000";
        context.fillRect(this.x-40, this.y+60, 100, 15);
        context.closePath();

        ///////
    }

    /*
     * Нанесение урона
     */

    getHirt(arg) {
        this.health -= arg;
        if(this.health < 0) { // Умерли
            clearInterval(intervalsID[0]);
            clearInterval(intervalsID[0]); // ...останавливаем рендеринг и генерацию врагов
            lose(); // Очищаем канвас и уведомляем о проигрыше
        }
    }
}

let bullets = [],
    oldX = 0,
    oldY = 0,
    down = false,
    PastTime = 0,
    pic  = new Image(),
    avatar = new Image(),
    canvas = document.getElementById("canvas"),
    context = canvas.getContext("2d"),
    weapons = [],
    enemies = [],
    player,
    intervalsID = [];

/*
 * Инициализация
 */

function init() {
    weapons.push(new Weapon('img/Pistols.png', 'sounds/Pistol.mp3', 2, 30, 1));
    weapons.push(new Weapon('img/Ralfe.png', 'sounds/Ralfe.mp3', 5, 60, 1));
    weapons.push(new Weapon('img/Drobash.png', 'sounds/drobovick.mp3', 1, 80, 7));
    weapons[0].isActive = true;
    pic.src  = 'img/bum.png';
    avatar.src = 'img/avatar.png';
    canvas.width = document.documentElement.clientWidth;
    canvas.height = document.documentElement.clientHeight;
    canvas.onmousemove = mouse_position;
    canvas.onmousedown = mouse_down;
    canvas.onmouseup = mouse_up;
    document.onkeydown = changeWeapons;
    player = new Player();
    intervalsID.push(setInterval(play, 1000 / 50));
    intervalsID.push(setInterval(createEnemy, 1000));
}

function createEnemy() {
    enemies.push(new Enemy());
    enemies.forEach(function(enemy, i){
        if(enemy.isBite()) {
            player.getHirt(1);
        }
    });
}

/*
 * Вызывается каждый tick игры
 */

function play () {
    draw ();
    drawCursor(oldX, oldY);
    if (down == true) {
        shooting(oldX, oldY);
    }
}

/*
 * Отрисовка всех графических элементов(интерфейс, пули, мишень...)
 */

function draw() {
    context.beginPath();
    context.fillStyle = "#687F75";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#333";
    context.fillRect(0, 0, canvas.width, 100);
    context.closePath();

    // Удаляем старые метки от пуль
    if(bullets.length > 20) {
        bullets.shift();
    }

    // Отрисовывка пуль
    for (let i=0; i<=bullets.length-1; i++) {
        drawBum(bullets[i][0], bullets[i][1]);
    }

    // Отрисовка врагов
    enemies.forEach(function (enemy) {
        enemy.draw();
    });

    user_interface();
    player.draw();
}

/*
 * Отрисовка интерфейса
 */

function user_interface() {

    weapons.forEach(function(weapon, i) {
        weapon.draw(i);
    }); // Рендерим оружие

    context.beginPath();
    context.strokeStyle = "#1B1FFF";
    context.fillStyle = "#1B1FFF";
    context.arc(85, canvas.height-85, 80, 0, 2 * Math.PI);
    context.fillRect(5,canvas.height-85, canvas.width-15, 80);
    context.fill();
    context.drawImage(avatar, 10, canvas.height-160);
    context.strokeStyle = "#FFF";
    context.font = 'bold 30px sans-serif';
    context.strokeText(player.stat.money+'$', canvas.width/2, canvas.height-35);
    context.strokeText('Убито: '+player.stat.hits, 400, canvas.height-35);
    context.strokeText('Мимо: '+player.stat.missed, 900, canvas.height-35);
    context.closePath();
}

/*
 * Отрисовка прицела
 * Стоит упаковать в класс Coursor
 * @param Integer x - координата x
 * @param Integer y - координата y
 */

function drawCursor(x, y) {
    context.beginPath();
    context.strokeStyle = "#000";
    context.arc(x, y, 16, 0, 2 * Math.PI);
    context.moveTo(x, y-16);
    context.lineTo(x, y+16);
    context.moveTo(x-16, y);
    context.lineTo(x+16, y);
    context.stroke();
    context.closePath();
}

/*
 * Костыльный перерасчет для позиций
 * Стоит упаковать в класс Coursor
 */

function mouse_position(event) {
    let x = 0;
    let y = 0;

    if (document.attachEvent != null) {
        x = window.event.clientX;
        y = window.event.clientY;
    } else if (!document.attachEvent && document.addEventListener) {
        x = event.clientX;
        y = event.clientY;
    }

    drawCursor(x, y);
    oldX = x;
    oldY = y;
}

/*
 * Функция для отрисовки отверстия
 * @param Integer x - координата x
 * @param Integer y - координата y
 */

function drawBum(x, y) {
    context.beginPath();
    context.fillStyle = "#335544";
    context.arc(x, y, 2, 0, 2 * Math.PI);
    context.fill();
    context.closePath();
}

/*
 * Костыли...
 * Но работает!
 */

function mouse_down () {
    down = true;
}

function mouse_up () {
    down = false;
}

/*
 * Обработчик нажатия клавиши на клавиатере
 * (Нужно рефакторить + есть баг: можем нажать любую кнопку отличную от 1, 2 или 3 и у нас исчезнет оружие)
 */

function changeWeapons(event) {
    if(event.keyCode >= 49 && event.keyCode <= 49 + weapons.length-1) {
        weapons.forEach(function(weapon) {
            weapon.isActive = false;
        });
        weapons[event.keyCode - 49].isActive = true;
    }
}

/*
 * Обработчик, когда клавиша стрельбы зажата
 * @param Integer x - координата x текущего положения курсора
 * @param Integer y - координата y текущего положения курсора
 */

function shooting(x, y) {
    var d = new Date();
    weapons.forEach(function (weapon) {
        if(weapon.isActive) {
            if (d.getTime()-PastTime >= 1000/weapon.speedShot) { // Ограничиваем скорострельность
                weapon.playSound();
                shoot(weapon.strikes(x,y)); // Посылаем в обработчик массив произведенных выстрелов оружием
                PastTime = d.getTime();
            }
        }
    });
}

/*
 * Обработчик, когда клавиша стрельбы зажата
 * @param Array strikes - массив с координатами пуль от текущего произведенного выстрела.
 * Массив добавляет гибкости, можем сделать двустволку или еще что-нибудь подобное
 */

function shoot(strikes) {
    strikes.forEach(function (coords) {

        drawBum(coords[0], coords[1]); // Рисуем отверстие
        player.stat.addMissed(1); // Добавляем промах
        bullets.push([coords[0], coords[1]]); // Добавляем отверстие

        enemies.forEach(function(enemy, i, arr){
            if(enemy.isHit(coords[0], coords[1])) {
                player.stat.addHits(1);
                player.stat.addMoney(100);
                enemies.splice(i, 1); // Убит - удаляем и добавляем очки
            }
        });
    });

}

/*
 * Получение псевдослучайного числа
 * @param Integer min - нижний порог случайного числа
 * @param Integer max - верхний порог случайного числа
 * @return Integer - случайное число в промежутке (min, max)
 */

function getRandomInt(min, max)
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/*
 * Получение псевдослучайного цвета
 * @return String - случайный цвет в HEX
 */

function getRandomColor() {
    return '#' + getRandomInt(0, 9) + getRandomInt(0, 9) + getRandomInt(0, 9);
}

/*
 * Закрашивание экрана и сообщение о проигрыше
 */

function lose() {
    context.beginPath();
    context.fillStyle = "#687F75";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#FFF";
    context.strokeText('Вы проиграли!', canvas.width/2, canvas.height/2);
    context.closePath();
}

init();