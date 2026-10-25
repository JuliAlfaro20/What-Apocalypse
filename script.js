//seccion de variables

let colision = false
let alertaMostrada = false;
let corriendo = false;
let distancia = 0;
let puntos = 0;
let monedasRecogidas = 0;
let toqueMoneda = false;
let record = Number(localStorage.getItem("record")) || 0;

const config = {
    type: Phaser.AUTO,
    width: 1500,
    height: 500,
    parent: "juego",
    backgroundColor: "#000000",
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: "arcade",
        arcade: {
            gravity: {
                y: 850
            },
            debug: true
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

//fin de la seccion de variables

function preload() {
    /*Aqui se carga con antelación cualquier cosa que vayamos a usar en el phaser*/
    this.load.image("fondo", "https://i.ibb.co/jvmHRtDY/ciudad2.png")

    this.load.spritesheet("stickman", "./assets/stickman_animacion.png", {
        frameWidth: 144,
        frameHeight: 208
    });
    
    this.load.spritesheet("perder", "./assets/animacion_perder.png", {
    frameWidth: 320,
    frameHeight: 240
    });

    this.load.image("piedra", "https://static.vecteezy.com/system/resources/thumbnails/069/748/606/small/pixel-art-of-a-gray-toned-stepped-rock-on-a-transparent-background-free-png.png");
    this.load.image("manosZ", "./assets/manosR.png");
    this.load.image("moneda", "assets/moneda.webp");

    
}

function create()
{
    colision = false;
    alertaMostrada = false;
    corriendo = false;
    distancia = 0;
    puntos = 0;
    monedasRecogidas = 0;
    toqueMoneda = false;



    this.fondo = this.add.tileSprite(750, 250, 1500, 500, "fondo");
    //recuerden crear cualquier cosa despues del fondo para que este no tapé los demas elementos
    
    document.getElementById("puntajeMaximo").innerHTML = record + " puntos";

    this.stickman = this.physics.add.sprite(120, 500, "stickman");
    this.stickman.setScale(0.5);
    this.stickman.setSize(93,164); 
    this.stickman.setCollideWorldBounds(true);
    this.stickman.setBounce(0);

    this.cursor = this.input.keyboard.createCursorKeys();
    this.teclaEspacio = this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.SPACE
    );

    // Grupo de obstáculos: sin gravedad e inmóviles
    this.obstaculos = this.physics.add.group({
        allowGravity: false,
        immovable: true
    });


    this.moneda = this.physics.add.image(500, 400, "moneda");
    this.moneda.setSize(275, 275);
    this.moneda.setScale(0.05);
    this.moneda.setImmovable(true);
    this.moneda.body.setAllowGravity(false);

    this.piedra = this.obstaculos.create(1600, 515, "piedra");
    this.piedra.setOrigin(0.5, 1);
    this.piedra.setSize(200, 210);
    this.piedra.setScale(0.2);

    this.manosZ = this.obstaculos.create(2300, 515, "manosZ");
    this.manosZ.setOrigin(0.5, 1);
    this.manosZ.setSize(280,40)
    this.manosZ.setScale(0.2);

    // Si toca cualquier obstáculo, pierde
    this.physics.add.overlap(this.stickman, this.obstaculos, () => {
        colision = true;
    });

    /*Esta seccion es para el sistema de monedas */

this.physics.add.overlap(this.stickman, this.moneda, () => {
    monedasRecogidas++;
    this.moneda.x = 1600 + Phaser.Math.Between(300, 900);
});



    this.anims.create({
        key: "correr",
        frames: this.anims.generateFrameNumbers("stickman", {
            start: 0,
            end: 6
        }),
        frameRate: 12,
        repeat: -1
    });

    this.anims.create({
    key: "animPerder",
    frames: this.anims.generateFrameNumbers("perder", { start: 0, end: 21 }),
    frameRate: 12,
    repeat: 0
    });
}



function update(time,delta)
{

    if (corriendo && !colision) {
        distancia += 300 * (delta / 1000);
        puntos = Math.floor(distancia / 10);
    }

    // El valor del sistema de puntos estara almacenada
    // en la variable puntos y se imprimira mediante:

    document.getElementById("puntos").innerHTML = puntos + " Puntos";
    document.getElementById("monedas").innerHTML = monedasRecogidas;



    if (corriendo && !colision) {
        this.stickman.anims.play("correr", true);
    } else {
        this.stickman.anims.stop();
    }

    if (corriendo && !colision) {
        this.fondo.tilePositionX += 300 * (delta / 1000);
    }


    
    if (Phaser.Input.Keyboard.JustDown(this.teclaEspacio)) {
        if (!corriendo) {
            corriendo = true;
            this.moneda.setVelocityX(-300)
            this.obstaculos.setVelocityX(-300); // mueve los obstaculos y las monedas
        } else if (this.stickman.body.blocked.down) {
            this.stickman.setVelocityY(-500);
        }


    }

    // Al salir por la izquierda, el obstáculo reaparece a la derecha

    this.obstaculos.getChildren().forEach((obstaculo) => {
        if (obstaculo.x < -100 ) {
            obstaculo.x = 1600 + Phaser.Math.Between(300, 900);

        }
    });

    if (this.moneda.x < -100) {
    this.moneda.x = 1600 + Phaser.Math.Between(300, 900);
}


if (colision && !alertaMostrada) {
    alertaMostrada = true;
    this.physics.pause();

    let nuevoRecord = false;
    if (puntos > record) {
        record = puntos;
        localStorage.setItem("record", record);
        nuevoRecord = true;
    }

    // Oculta al stickman y pone la animación de derrota en su lugar
    this.stickman.setVisible(false);
    const perder = this.add.sprite(this.stickman.x, this.stickman.y, "perder");
    perder.setOrigin(0.5, 1);
    perder.setScale(0.5);
    perder.play("animPerder");

    // Cuando termina la animación, muestra la alerta
    perder.on("animationcomplete", () => 
        {
        Notiflix.Report.failure(
        "GAME OVER",
        (nuevoRecord ? "¡NUEVO RÉCORD! " : "") + "puntos: " + puntos + " | Récord: " + record,
        "REINTENTAR",
        () => { this.scene.restart(); }
        );
    });
}



}