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
}

/*
 * Класс для хранения данных о статистике
 */
class Statistic {

    constructor() {
        this.hits = 0; // Попадания
        this.missed = 0; // Мимо
        this.money = 0; // Текущие очки
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
        this.x = 0;
        this.y = canvas.height/2 + getRandomInt(-200, 200);
        this.date = new Date();
        this.pastTime = this.date.getTime();
        this.colorBody = getRandomColor();
        this.colorEye = getRandomColor();
    }

    draw() {
        this.go();
        context.beginPath();
        context.fillStyle = this.colorBody;
        context.fillRect(this.x, this.y, 50, 50);
        context.fillStyle = this.colorEye;
        context.fillRect(this.x+5, this.y+10, 15, 15);
        context.fillRect(this.x+25, this.y+10, 15, 15);
        context.closePath();
    }

    go() {
        this.date = new Date();
        if (this.date.getTime()-this.pastTime >= 500) {
            this.x += 50;
            this.y += getRandomInt(-10,10);
            if(this.y < 200) this.y = 200;
            if(this.y > canvas.height-200) this.y = canvas.height-200;
            this.pastTime = this.date.getTime();

        }
    }

    isHit(x, y) {
        if( (x < this.x+50) && (x > this.x) ) {
            if( (y < this.y+50) && (y > this.y) ) {
                return true;
            }
        }

        return false;
    }

    isGone() {
        if(this.x >= canvas.width) {
            return true;
        }
        return false;
    }
}

class Player {
    constructor() {
        this.stat = new Statistic();
    }
}

let bullets = [],
    points = [],
    oldX = 0,
    oldY = 0,
    x_pos = 0,
    down = false,
    PastTime = 0,
    pic  = new Image(),
    avatar = new Image(),
    canvas = document.getElementById("canvas"),
    context = canvas.getContext("2d"),
    stat = new Statistic(),
    weapons = [],
    enemies = [],
    player = new Player();

/*
 * Инициализация
 */

function init() {
    weapons.push(new Weapon('img/Pistols.png', 'sounds/Pistol.mp3', 2, 80, 1));
    weapons.push(new Weapon('img/Ralfe.png', 'sounds/Ralfe.mp3', 5, 160, 1));
    weapons.push(new Weapon('img/Drobash.png', 'sounds/Drobovick.mp3', 1, 240, 10));
    weapons[0].isActive = true;
    pic.src  = 'img/bum.png';
    avatar.src = 'img/avatar.png';
    canvas.width = document.documentElement.clientWidth;
    canvas.height = document.documentElement.clientHeight;
    canvas.onmousemove = mouse_position;
    canvas.onmousedown = mouse_down;
    canvas.onmouseup = mouse_up;
    document.onkeydown = changeWeapons;
    setInterval(play, 1000 / 50);
    setInterval(createEnemy, 1000);
}

function createEnemy() {
    enemies.push(new Enemy());
    enemies.forEach(function(enemy, i){
        if(enemy.isGone()) {
            player.stat.addMoney(-5000);
            enemies.splice(i, 1); // Ушел за экран - удаляе и отнимаем очки
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
    context.closePath();

    enemies.forEach(function (enemy) {
        enemy.draw();
    });

    if(bullets.length > 20) {
        bullets.shift();
    }
    for (let i=0; i<=bullets.length-1; i++) {
        drawBum(bullets[i][0], bullets[i][1]);
    }
    user_interface();
}

/*
 * Отрисовка интерфейса
 */

function user_interface() {

    weapons.forEach(function(weapon, i) {
        context.beginPath();
        context.strokeStyle = "#1B1FFF";

        if (weapon.isActive === true) {
            context.fillStyle = "#ccc";
        } else {
            context.fillStyle = "#fff";
        }

        context.strokeRect(5+(165*i),5, 155, 85);
        context.fillRect(5+(165*i),5, 155, 85);
        context.drawImage(weapon.getImage(), 10+(165*i), 10);
        context.closePath();
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
    context.drawImage(pic, x-15, y-15);
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
    weapons.forEach(function(weapon) {
        weapon.isActive = false;
    });
    weapons[event.keyCode - 49].isActive = true;
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

function getRandomColor() {
    return '#' + getRandomInt(0, 9) + getRandomInt(0, 9) + getRandomInt(0, 9);
}

init();