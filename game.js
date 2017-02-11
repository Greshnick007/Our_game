var bullets = [];
var points = [];


var oldX = 0;
var oldY = 0;
var pic  = new Image();
pic.src  = 'img/bum.png';
var avatar = new Image();
avatar.src = 'img/avatar.png';
var canvas = document.getElementById("canvas");
context = canvas.getContext("2d");
var k = 105;

var x_pos = 0;
var down = false;
var PastTime = 0;



/*
 * Класс оружия
 */
class Weapon {
    constructor(imageSource, soundSource, speedShoot, razbros) {
        this.setImage(imageSource); // Изображение оружия
        this.setSound(soundSource); // Звук оружия
        this.isActive = false; // Является выбранным?
        this.setSpeedShoot(speedShoot); // Скорострельность
        this.setRazbros(razbros); // Разброс
    }

    setRazbros(arg) {
        this.razbros = arg;
    }

    getRazbros() {
        return this.razbros;
    }

    setSpeedShoot(arg) {
        this.speedShot = arg;
    }

    getSpeedShoot() {
        return this.speedShot;
    }

    setSound(arg) {
        this.srcAudio = arg;
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

    setIsActive(arg) {
        this.isActive = arg;
    }

    getIsActive() {
        return this.isActive;
    }
}

class Pistol extends Weapon {
    constructor() {
        super('img/Pistols.png', 'sounds/Pistol.mp3', 2, 80);
    }

    strikes(x, y) {
        let array = [];
        array.push([
            x + getRandomInt(0 -  this.getRazbros()/2, this.getRazbros()/2),
            y + getRandomInt(0 -  this.getRazbros()/2, this.getRazbros()/2)
        ]);
        return array;
    }
}

class Rifle extends Weapon {
    constructor() {
        super('img/Ralfe.png', 'sounds/Ralfe.mp3', 5, 160);
    }

    strikes(x, y) {
        let array = [];
        array.push([
            x + getRandomInt(0 -  this.getRazbros()/2, this.getRazbros()/2),
            y + getRandomInt(0 -  this.getRazbros()/2, this.getRazbros()/2)
        ]);
        return array;
    }
}

class Shotgun extends Weapon {
    constructor() {
        super('img/Drobash.png', 'sounds/Drobovick.mp3', 1, 240);
    }

    strikes(x, y) {
        let array = [];
        let i;
        for(i = 0; i<10; ++i) {
            array.push([
                x + getRandomInt(0 -  this.getRazbros()/2, this.getRazbros()/2),
                y + getRandomInt(0 -  this.getRazbros()/2, this.getRazbros()/2)
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

    getScore(){
        return this.score;
    }

    getHits(){
        return this.hits;
    }

    getMissed(){
        return this.missed;
    }

    clearStat() {
        constructor();
    }
}



let stat = new Statistic();

let weapons = [];
weapons.push(new Pistol());
weapons.push(new Rifle());
weapons.push(new Shotgun());
weapons[0].setIsActive(true);

/*
 * Инициализация
 */

function init() {
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

    if (x_pos >= canvas.width) {x_pos =0; bullets = [];}
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
        if (weapon.getIsActive() === true) {context.fillStyle = "#ccc";}
        else {context.fillStyle = "#fff";}
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
    context.strokeText(stat.getScore(), canvas.width/2, canvas.height-35);
    context.strokeText('Попал: '+stat.getHits(), 400, canvas.height-35);
    context.strokeText('Мимо: '+stat.getMissed(), 900, canvas.height-35);
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
    var x = 0;
    var y = 0;
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

function mouse_down (event) {
    down = true;
}

function mouse_up (event) {
    down = false;
}

/*
 * Обработчик нажатия клавиши на клавиатере
 * (Нужно рефакторить + есть баг: можем нажать любую кнопку отличную от 1, 2 или 3 и у нас исчезнет оружие)
 */

function changeWeapons(event) {
    weapons.forEach(function(weapon, i, list) {
        weapon.setIsActive(false)
    });
    weapons[event.keyCode - 49].setIsActive(true);
}

/*
 * Обработчик, когда клавиша стрельбы зажата
 * @param Integer x - координата x текущего положения курсора
 * @param Integer y - координата y текущего положения курсора
 */

function shooting(x, y) {
    var d = new Date();
    weapons.forEach(function (weapon, i, arr) {
        if(weapon.getIsActive()) {
            if (d.getTime()-PastTime >= 1000/weapon.getSpeedShoot()) { // Ограничиваем скорострельность
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
        xc = x_pos;
        yc = (canvas.height/2)-50;
        var d=Math.sqrt(Math.pow(coords[1]-yc,2)+Math.pow(coords[0]-xc, 2));
        var rez = Math.ceil(d/20);

        if (rez<=10) {
            stat.addScore( Math.ceil(100/rez) ); // Добавляем очки
            stat.addHits(1); // ...и попадания

            if (points.length-1>=29) {
                points.shift(); // Ограничение количества отверстий? Но оно не работает
            }

            points.push([coords[0], coords[1]-Math.sin(x_pos/100)*100]);
        } else {
            stat.addMissed(1); // Добавляем промах

            if (bullets.length-1>=30) {
                bullets.shift();
            }

            bullets.push([coords[0], coords[1]]);
        }
    });

}

/*
 * Обработчик, когда клавиша стрельбы зажата
 * @param Integer min - нижний порог случайного числа
 * @param Integer max - верхний порог случайного числа
 * @return Integer - случайное число в промежутке (min, max)
 */

function getRandomInt(min, max)
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

init();