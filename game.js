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
        this.score = 0; // Текущие очки
    }

    addScore(arg) {
        this.score += arg;
    }

    addMissed(arg) {
        this.missed += arg;
    }

    addHits(arg) {
        this.hits += arg;
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
    weapons = [];

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

    if (x_pos >= canvas.width) {
        x_pos =0;
        bullets = [];
        points = [];
    }
    x_pos+=5;
    for (var i=0; i<=bullets.length-1; i++) {
        drawBum(bullets[i][0], bullets[i][1]);
    }
    michen(x_pos, (canvas.height/2)-50+Math.sin(x_pos/100)*100);
    for (var i=0; i<=points.length-1; i++) {
        points[i][0] +=5;
        drawBum(points[i][0], points[i][1]+Math.sin(x_pos/100)*100);
    }
    user_interface();
}

/*
 * Отрисовка интерфейса
 */

function user_interface() {

    weapons.forEach(function(weapon, i, arr) {
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
    context.strokeText(stat.score, canvas.width/2, canvas.height-35);
    context.strokeText('Попал: '+stat.hits, 400, canvas.height-35);
    context.strokeText('Мимо: '+stat.missed, 900, canvas.height-35);
    context.closePath();
}

/*
 * Отрисовка мишени
 * @param Integer x - координата x
 * @param Integer y - координата y
 */

function michen (x, y) {
    var k = 200;
    for (var i= 0; i<=9; i++) {
        context.beginPath();
        context.strokeStyle ="#1B1FFF";
        context.fillStyle ="#FFF";
        context.arc(x, y, k, 0, 2*Math.PI);
        context.fill();
        context.stroke();
        context.closePath();
        k = k - 20;
    }
    context.beginPath();
    context.fillStyle ="#1B1FFF";
    context.arc(x, y, 20, 0, 2*Math.PI);
    context.fill();
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
    weapons.forEach(function(weapon, i, list) {
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
    weapons.forEach(function (weapon, i, arr) {
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
    strikes.forEach(function (coords, i, arr) {
        drawBum(coords[0], coords[1]); // Рисуем отверстие
        let xc = x_pos;
        let yc = (canvas.height/2)-50;
        let d=Math.sqrt(Math.pow(coords[1]-yc,2)+Math.pow(coords[0]-xc, 2));
        let rez = Math.ceil(d/20);

        if (rez<=10) {
            stat.addScore( Math.ceil(100/rez) ); // Добавляем очки
            stat.addHits(1); // ...и попадания
            points.push([coords[0], coords[1]-Math.sin(x_pos/100)*100]);
        } else {
            stat.addMissed(1); // Добавляем промах
            bullets.push([coords[0], coords[1]]);
        }
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

init();