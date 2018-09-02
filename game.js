// The point and size class used in this program
function Point(x, y) {
    this.x = (x)? parseFloat(x) : 0.0;
    this.y = (y)? parseFloat(y) : 0.0;
}

function Size(w, h) {
    this.w = (w)? parseFloat(w) : 0.0;
    this.h = (h)? parseFloat(h) : 0.0;
}

// Helper function for checking intersection between two rectangles
function intersect(pos1, size1, pos2, size2) {
    return (pos1.x < pos2.x + size2.w && pos1.x + size1.w > pos2.x &&
            pos1.y < pos2.y + size2.h && pos1.y + size1.h > pos2.y);
}


// The player class used in this program
function Player() {
    this.node = svgdoc.getElementById("player");
    this.position = PLAYER_INIT_POS;
    this.motion = motionType.NONE;
    this.verticalSpeed = 0;
    this.face=faceType.RIGHT;
}

Player.prototype.isOnPlatform = function() {
    var platforms = svgdoc.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue; 

        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));

        if (((this.position.x + PLAYER_SIZE.w > x && this.position.x < x + w) ||
             ((this.position.x + PLAYER_SIZE.w) == x && this.motion == motionType.RIGHT) ||
             (this.position.x == (x + w) && this.motion == motionType.LEFT)) &&
            this.position.y + PLAYER_SIZE.h == y) return true;
    }
    if (this.position.y + PLAYER_SIZE.h == SCREEN_SIZE.h) return true;

    return false;
}

Player.prototype.collidePlatform = function(position) {
    var platforms = svgdoc.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;

        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));
        var pos = new Point(x, y);
        var size = new Size(w, h);

        if (intersect(position, PLAYER_SIZE, pos, size)) {
            position.x = this.position.x;
            if (intersect(position, PLAYER_SIZE, pos, size)) {
                if (this.position.y >= y + h)
                    position.y = y + h;
                else
                    position.y = y - PLAYER_SIZE.h;
                this.verticalSpeed = 0;
            }
        }
    }
}

Player.prototype.isOnExit = function() {
    var exit = svgdoc.getElementById("exit");
    var x = parseFloat(exit.getAttribute("x"));
    var y = parseFloat(exit.getAttribute("y"));
    var w = parseFloat(exit.getAttribute("width"));
    var h = parseFloat(exit.getAttribute("height"));
    if (((this.position.x + PLAYER_SIZE.w > x && this.position.x < x + w) ||
         ((this.position.x + PLAYER_SIZE.w) == x && this.motion == motionType.RIGHT) ||
         (this.position.x == (x + w) && this.motion == motionType.LEFT)) &&
        this.position.y + PLAYER_SIZE.h == y) return true;

    if (this.position.y + PLAYER_SIZE.h == SCREEN_SIZE.h) return true;

    return false;
}

Player.prototype.collideExit = function(position) {
    var exit = svgdoc.getElementById("exit");
    var x = parseFloat(exit.getAttribute("x"));
    var y = parseFloat(exit.getAttribute("y"));
    var w = parseFloat(exit.getAttribute("width"));
    var h = parseFloat(exit.getAttribute("height"));

    var pos = new Point(x, y);
    var size = new Size(w, h);

    if (intersect(position, PLAYER_SIZE, pos, size)) {
        position.x = this.position.x;
        if (intersect(position, PLAYER_SIZE, pos, size)) {
            if (this.position.y >= y + h)
                position.y = y + h;
            else
                position.y = y - PLAYER_SIZE.h;
            this.verticalSpeed = 0;
        }
    }
}





Player.prototype.collideScreen = function(position) {
    if (position.x < 0) position.x = 0;
    if (position.x + PLAYER_SIZE.w > SCREEN_SIZE.w) position.x = SCREEN_SIZE.w - PLAYER_SIZE.w;
    if (position.y < 0) {
        position.y = 0;
        this.verticalSpeed = 0;
    }
    if (position.y + PLAYER_SIZE.h > SCREEN_SIZE.h) {
        position.y = SCREEN_SIZE.h - PLAYER_SIZE.h;
        this.verticalSpeed = 0;
    }
}


//
// Below are constants used in the game
//
var PLAYER_SIZE = new Size(40, 40);         // The size of the player
var SCREEN_SIZE = new Size(600, 560);       // The size of the game screen
var PLAYER_INIT_POS  = new Point(0, 420);   // The initial position of the player

var MOVE_DISPLACEMENT = 5;                  // The speed of the player in motion
var JUMP_SPEED = 15;                        // The speed of the player jumping
var VERTICAL_DISPLACEMENT = 1;              // The displacement of vertical speed

var GAME_INTERVAL = 25;                     // The time interval of running the game

var BULLET_SIZE = new Size(10, 10);         // The speed of a bullet
var BULLET_SPEED = 10.0;                    // The speed of a bullet
                                            //  = pixels it moves each game loop
var GOODTHING_SIZE= new Size(40,40);
var goodthingCount=8;


var SHOOT_INTERVAL = 200.0;                 // The period when shooting is disabled
var canShoot = true;                        // A flag indicating whether the player can shoot a bullet

var MONSTER_SIZE = new Size(40, 40);        // The speed of a bullet
var MONSTER_SPEED = 1000;


//
// Variables in the game
//
var motionType = {NONE:0, LEFT:1, RIGHT:2}; // Motion enum
var faceType= {NONE:0, LEFT:1, RIGHT:2}; //position enum


var svgdoc = null;                          // SVG root document node
var player = null;                          // The player object
var gameInterval = null;                    // The interval
var zoom = 1.0;                             // The zoom level of the screen
var score = 0;                              // The score of the game
var timeInterval=null;  
var time=140;
var bullets=8;
var cheatMode=false;
var name="";
var endGame=false;

    


//
// The load function for the SVG document
//
function load(evt) {
    // Set the root node to the global variable
    svgdoc = evt.target.ownerDocument;
}



//
// This function removes all/certain nodes under a group
//
function cleanUpGroup(id, textOnly) {
    var node, next;
    var group = svgdoc.getElementById(id);
    node = group.firstChild;
    while (node != null) {
        next = node.nextSibling;
        if (!textOnly || node.nodeType == 3) // A text node
            group.removeChild(node);
        node = next;
    }
}


//
// This function creates the monsters in the game
//
function createMonster(x, y) {
    var monster = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
    monster.setAttribute("x", x);
    monster.setAttribute("y", y);
    monster.setAttribute("motion", motionType.LEFT);
    monster.setAttribute("counter", 0);
    monster.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#monster");
    svgdoc.getElementById("monsters").appendChild(monster);
}

function createGoodThing(x,y){
    var goodthing = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
    goodthing.setAttribute("x", x);
    goodthing.setAttribute("y", y);
    goodthing.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#goodthing");
    svgdoc  .getElementById("goodthings").appendChild(goodthing);


}


//
// This function shoots a bullet from the player
//
function shootBullet() {
    // Disable shooting for a short period of time
    canShoot = false;
    setTimeout("canShoot = true", SHOOT_INTERVAL);

    // Create the bullet using the use node
    var bullet = svgdoc.createElementNS("http://www.w3.org/2000/svg", "use");
    bullet.setAttribute("x", player.position.x + PLAYER_SIZE.w / 2 - BULLET_SIZE.w / 2);
    bullet.setAttribute("y", player.position.y + PLAYER_SIZE.h / 2 - BULLET_SIZE.h / 2);
    bullet.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#bullet");
    //console.log(bullet.attributes);
    if(player.face==faceType.RIGHT)
        bullet.attributes.type = "right";
    else 
        bullet.attributes.type= "left";
    //console.log("-------------------------------------------------------");
    //console.log(bullet.attributes);
    svgdoc.getElementById("bullets").appendChild(bullet);


}


//
// This is the keydown handling function for the SVG document
//
function keydown(evt) {
    var keyCode = (evt.keyCode)? evt.keyCode : evt.getKeyCode();

    switch (keyCode) {
        case "A".charCodeAt(0):
            player.motion = motionType.LEFT;
            player.face = faceType.LEFT;
            break;

        case "D".charCodeAt(0):
            player.motion = motionType.RIGHT;
            player.face= faceType.RIGHT;
            break;
			
        case "W".charCodeAt(0):
            if(!cheatMode){
                if (player.isOnPlatform()) {
                    player.verticalSpeed = JUMP_SPEED;
                }
            }
            else
            player.verticalSpeed = JUMP_SPEED;
            
            break;

        case 32:
            if (canShoot) {
                if(cheatMode)
                    shootBullet();
                else{
                    if(bullets!=0){
                        shootBullet();
                        bullets--;
                        svgdoc.getElementById("bulletleft").firstChild.data=bullets;
                    }  
                }

            }
            break;

        case "C".charCodeAt(0):
            cheatMode=true;
            svgdoc.getElementById("player").style.setProperty("opacity", "0.5", null);
            break;

        case "V".charCodeAt(0):
            cheatMode=false;
            svgdoc.getElementById("player").style.setProperty("opacity", "1", null);
            break;
    }
}


//
// This is the keyup handling function for the SVG document
//
function keyup(evt) {
    // Get the key code
    var keyCode = (evt.keyCode)? evt.keyCode : evt.getKeyCode();

    switch (keyCode) {
        case "A".charCodeAt(0):
            if (player.motion == motionType.LEFT) {
                player.motion = motionType.NONE;
                player.face = faceType.LEFT;
            }
            break;

        case "D".charCodeAt(0):
            if (player.motion == motionType.RIGHT) {
                player.motion = motionType.NONE;
                player.face = faceType.RIGHT;
            }
            break;
    }
}


//
// This function checks collision
//
function collisionDetection() {
    // Check whether the player collides with a monster
    var monsters = svgdoc.getElementById("monsters");
    for (var i = 0; i < monsters.childNodes.length; i++) {
        var monster = monsters.childNodes.item(i);
        var x = parseInt(monster.getAttribute("x"));
        var y = parseInt(monster.getAttribute("y"));

        if (cheatMode==false && intersect(new Point(x, y), MONSTER_SIZE, player.position, PLAYER_SIZE)) {
            // Clear the game interval
            
            gameEnd();

            return;
        }
    }

     // Check whether the player collides with a goodthing
    var goodthings = svgdoc.getElementById("goodthings");
    for (var i = 0; i < goodthings.childNodes.length; i++) {
        var goodthing = goodthings.childNodes.item(i);
        var x = parseInt(goodthing.getAttribute("x"));
        var y = parseInt(goodthing.getAttribute("y"));

        if (intersect(new Point(x, y), GOODTHING_SIZE, player.position, PLAYER_SIZE)) {
            

                goodthings.removeChild(goodthing);
                goodthingCount--;
                i--;

                //write some code to update the score
                if(zoom==2.0){
                    score+=30;

                }
                else
                    score+=15;
                svgdoc.getElementById("score").firstChild.data=score;

                if(goodthingCount==0){
                    endGame=true;
                }
        }
    }
    

    // Check whether a bullet hits a monster
    var bullets = svgdoc.getElementById("bullets");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var bullet = bullets.childNodes.item(i);
        var x = parseInt(bullet.getAttribute("x"));
        var y = parseInt(bullet.getAttribute("y"));

        for (var j = 0; j < monsters.childNodes.length; j++) {
            var monster = monsters.childNodes.item(j);
            var mx = parseInt(monster.getAttribute("x"));
            var my = parseInt(monster.getAttribute("y"));

            if (intersect(new Point(x, y), BULLET_SIZE, new Point(mx, my), MONSTER_SIZE)) {
                monsters.removeChild(monster);
                j--;
                bullets.removeChild(bullet);
                i--;

                //write some code to update the score
                if(zoom==2.0){
                    score+=30;

                }
                else
                    score+=10;
                svgdoc.getElementById("score").firstChild.data=score;
            }
        }
    }

}


function portalDetection(){

    var portal1 = svgdoc.getElementById("portal1");
    var p1x= parseInt(portal1.getAttribute("x"));
    var p1y= parseInt(portal1.getAttribute("y"));

    var portal2 = svgdoc.getElementById("portal2");
    var p2x= parseInt(portal1.getAttribute("x"));
    var p2y= parseInt(portal1.getAttribute("y"));


    if (intersect (new Point(p1x,p1y), new Size(60,50), player.position, PLAYER_SIZE)){

    }


}

//
// This function updates the position of the bullets
//
function moveRightBullet(){
    // Go through all bullets
    var bullets = svgdoc.getElementById("bullets");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var node = bullets.childNodes.item(i);
        if(node.attributes.type=="right"){
            // Update the position of the bullet
            var x = parseInt(node.getAttribute("x"));

            node.setAttribute("x", x + BULLET_SPEED);
                // If the bullet is not inside the screen delete it from the group
                if (x > SCREEN_SIZE.w) {
                    bullets.removeChild(node);
                    i--;
                }
        }
        
    }
}

function moveLeftBullet(){
    // Go through all bullets
    var bullets = svgdoc.getElementById("bullets");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var node = bullets.childNodes.item(i);
        if(node.attributes.type=="left"){
            
            // Update the position of the bullet
            var x = parseInt(node.getAttribute("x"));

            node.setAttribute("x", x - BULLET_SPEED);
                // If the bullet is not inside the screen delete it from the group
                if (x > SCREEN_SIZE.w) {
                    bullets.removeChild(node);
                    i--;
                }
        }
        
    }
}


//
// This function updates the position and motion of the player in the system
//
function gamePlay() {
    // Check collisions
    collisionDetection();
    portalDetection();


    // Check whether the player is on a platform
    var isOnPlatform = player.isOnPlatform();

    var isOnExit = player.isOnExit();
    if(isOnExit){
        console.log("hiasfds");
        if(endGame)
             gameEnd();
    }

    var platforms = svgdoc.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
            var platform = platforms.childNodes.item(i);
            if (platform.nodeName != "rect") continue;

            //console.log(platform.getAttribute("type"));
                if (platform.getAttribute("type") == "disappearing") {
                    console.log("Inside disappearing if block: " + platform.getAttribute("type"));
                        var x = parseFloat(platform.getAttribute("x"));
                        var y = parseFloat(platform.getAttribute("y"));
                        var w = parseFloat(platform.getAttribute("width"));
                        var h = parseFloat(platform.getAttribute("height"));
                        var platformOpacity = parseFloat(platform.style.getPropertyValue("opacity"));

                        if (((player.position.x + PLAYER_SIZE.w > x && player.position.x < x + w) ||
                             ((player.position.x + PLAYER_SIZE.w) == x && player.motion == motionType.RIGHT) ||
                             (player.position.x == (x + w) && player.motion == motionType.LEFT)) &&
                            player.position.y + PLAYER_SIZE.h == y){

                                console.log("dis")
                                platformOpacity-=0.1;
                            if(platformOpacity==0){
                                platforms.removeChild(platform);
                            }
                            else{
                                platform.style.setProperty("opacity", platformOpacity, null);
                            }
                        }
                }

            }
    

    
    // Update player position
    var displacement = new Point();

    // Move left or right
    if (player.motion == motionType.LEFT){
        displacement.x = -MOVE_DISPLACEMENT;

    }

    if (player.motion == motionType.RIGHT){
        displacement.x = MOVE_DISPLACEMENT;
    }

    // Fall
    if (!isOnPlatform && player.verticalSpeed <= 0) {
        displacement.y = -player.verticalSpeed;
        player.verticalSpeed -= VERTICAL_DISPLACEMENT;
    }

    // Jump
    if (player.verticalSpeed > 0) {
        displacement.y = -player.verticalSpeed;
        player.verticalSpeed -= VERTICAL_DISPLACEMENT;
        if (player.verticalSpeed <= 0)
            player.verticalSpeed = 0;
    }

    // Get the new position of the player
    var position = new Point();
    position.x = player.position.x + displacement.x;
    position.y = player.position.y + displacement.y;

    // Check collision with platforms and screen
    player.collidePlatform(position);
    player.collideScreen(position);

    player.collideExit(position);

    // Set the location back to the player object (before update the screen)
    player.position = position;

    // Move the bullets
    moveRightBullet();
    moveLeftBullet();
    
       

    updateScreen();

    
    //search for disappearing platforms
    

}


//
// This function updates the position of the player's SVG object and
// set the appropriate translation of the game screen relative to the
// the position of the player
//
function updateScreen() {

    var monsters = svgdoc.getElementById("monsters");
    for (var i = 0; i < monsters.childNodes.length; i++) {
        var node = monsters.childNodes.item(i);
        moveMonster(node, parseInt(node.getAttribute("x")), parseInt(node.getAttribute("y")), parseInt(node.getAttribute("nx")), parseInt(node.getAttribute("ny")));
    }
    // Transform the player
    //console.log("updateScreen");

    if (player.face == faceType.LEFT) {
        //console.log("left");
        player.node.setAttribute("transform", "translate(" + (player.position.x + PLAYER_SIZE.w) + ", " + player.position.y + ") scale(-1, 1)");
    } else {// if (player.motion == motionType.RIGHT) {
        //console.log("right");
        player.node.setAttribute("transform", "translate(" + player.position.x + "," + player.position.y + ")");
    }
    // Calculate the scaling and translation factors	
    var scale = new Point(zoom, zoom);
    var translate = new Point();
    
    translate.x = SCREEN_SIZE.w / 2.0 - (player.position.x + PLAYER_SIZE.w / 2) * scale.x;
    if (translate.x > 0) 
        translate.x = 0;
    else if (translate.x < SCREEN_SIZE.w - SCREEN_SIZE.w * scale.x)
        translate.x = SCREEN_SIZE.w - SCREEN_SIZE.w * scale.x;

    translate.y = SCREEN_SIZE.h / 2.0 - (player.position.y + PLAYER_SIZE.h / 2) * scale.y;
    if (translate.y > 0) 
        translate.y = 0;
    else if (translate.y < SCREEN_SIZE.h - SCREEN_SIZE.h * scale.y)
        translate.y = SCREEN_SIZE.h - SCREEN_SIZE.h * scale.y;
            
    // Transform the game area
    svgdoc.getElementById("gamearea").setAttribute("transform", "translate(" + translate.x + "," + translate.y + ") scale(" + scale.x + "," + scale.y + ")");	
}


//
// This function sets the zoom level to 2
//
function setZoom() {
    console.log();

    
    setNormal();

    zoom=2.0;

    }


var fillername="InsertName";

function setNormal(){

    var table = getHighScoreTable();
    hideHighScoreTable(table);


    var node = svgdoc.getElementById("startingarea");
    node.style.setProperty("visibility", "hidden", null);


    var node2 = svgdoc.getElementById("gamearea");
    node2.style.setProperty("visibility", "visible", null);

    var node3= svgdoc.getElementById("scoretracker");
    node3.style.setProperty("visibility", "visible", null);


    var node4= svgdoc.getElementById("timetracker");
    node4.style.setProperty("visibility", "visible", null);


    var node5= svgdoc.getElementById("bullettracker");
    node5.style.setProperty("visibility", "visible", null);

    var node6= svgdoc.getElementById("nametracker");
    node6.style.setProperty("visibility", "hidden", null);


    
    name = prompt("What is your name?", fillername);

    if (name==""||name==null||name=="InsertName"){
        name="Anonymous";
    }

    var node7=svgdoc.getElementById("player_name");
    node7.firstChild.data=name;

    // Attach keyboard events, add time
    svgdoc.documentElement.addEventListener("keydown", keydown, false);
    svgdoc.documentElement.addEventListener("keyup", keyup, false);
    svgdoc.getElementById("timeleft").firstChild.data=time;
    svgdoc.getElementById("bulletleft").firstChild.data=bullets;
    

    //dissappearingplatform
    var platforms = svgdoc.getElementById("platforms");

    // Create a new line element1
    var newPlatform = svgdoc.createElementNS("http://www.w3.org/2000/svg", "rect");

    // Set the various attributes of the line
    newPlatform.setAttribute("width", 80);
    newPlatform.setAttribute("height",5);
    newPlatform.setAttribute("x", 60);
    newPlatform.setAttribute("y", 140);
    newPlatform.setAttribute("type", "disappearing");
    newPlatform.style.setProperty("opacity", 1, null);
    newPlatform.style.setProperty("stroke", "darkblue", null);
    


    // Add the new platform to the end of the group
    platforms.appendChild(newPlatform);


    // Create a new line element2
    var newPlatform2 = svgdoc.createElementNS("http://www.w3.org/2000/svg", "rect");

    // Set the various attributes of the line
    newPlatform2.setAttribute("width", 60);
    newPlatform2.setAttribute("height", 5);
    newPlatform2.setAttribute("x", 360);
    newPlatform2.setAttribute("y", 200);
    newPlatform2.setAttribute("type", "disappearing");
    newPlatform2.style.setProperty("opacity", 1, null);
    newPlatform2.style.setProperty("stroke", "darkblue", null);;

    // Add the new platform to the end of the group
    platforms.appendChild(newPlatform2);

    // Create a new line element2
    var newPlatform3 = svgdoc.createElementNS("http://www.w3.org/2000/svg", "rect");

    // Set the various attributes of the line
    newPlatform3.setAttribute("width", 60);
    newPlatform3.setAttribute("height", 5);
    newPlatform3.setAttribute("x", 300);
    newPlatform3.setAttribute("y", 450);
    newPlatform3.setAttribute("type", "disappearing");
    newPlatform3.style.setProperty("opacity", 1, null);
    newPlatform3.style.setProperty("stroke", "darkblue", null);
   

    // Add the new platform to the end of the group
    platforms.appendChild(newPlatform3);

    // Remove text nodes in the 'platforms' group
    cleanUpGroup("platforms", true);

    // Create the player
    player = new Player();

    // Create the monsters

    //monster1
    
    var x1= Math.floor(Math.random()*500)+40;
    var y1= Math.floor(Math.random()*80)+20;

    createMonster(x1,y1);

    //monster2
    
    var x2= Math.floor(Math.random()*500)+40;
    var y2= Math.floor(Math.random()*60)+100;

    createMonster(x2,y2);

    //monster3
    var x3= Math.floor(Math.random()*500)+40;
    var y3= Math.floor(Math.random()*60)+160;

    createMonster(x3,y3);

    //monster4
    var x4= Math.floor(Math.random()*500)+40;
    var y4= Math.floor(Math.random()*60)+220;

    createMonster(x4,y4);

    //monster5
    var x5= Math.floor(Math.random()*500) +40;
    var y5= Math.floor(Math.random()*60) +280;

    createMonster(x5,y5);

    //monster6
    var x6= Math.floor(Math.random()*500) +40;
    var y6= Math.floor(Math.random()*60) +340;

    createMonster(x6,y6);



    for (i = 0; i < 8; i++) {
        var xs, ys;

        if (i == 0) {
            xs= Math.floor(Math.random()*500)+40;
            ys= Math.floor(Math.random()*80)+20;
        }
        else if (i == 1) {
            xs= Math.floor(Math.random()*500)+40;
            ys= Math.floor(Math.random()*60)+100;
        }
        else if ( i == 2) {
            xs= Math.floor(Math.random()*500)+40;
            ys= Math.floor(Math.random()*60)+160;
        }
        else if ( i == 3) {
            xs= Math.floor(Math.random()*500)+40;
            ys= Math.floor(Math.random()*60)+220;
        }
        else if ( i == 4) {
            xs= Math.floor(Math.random()*500) +40;
            ys= Math.floor(Math.random()*60) +280;
        }
        else if ( i == 5) {
            xs= Math.floor(Math.random()*500) +40;
            ys= Math.floor(Math.random()*60) +280;
        }
        else if ( i == 6) {
            xs= Math.floor(Math.random()*500) +40;
            ys= Math.floor(Math.random()*60) +340;
        }       
        else {
            xs= Math.floor(Math.random()*500);
            ys= Math.floor(Math.random()*40)+20;
        }

        createGoodThing(xs,ys);
    }


    // Start the game interval
    
    timeInterval = setInterval("timePlay()", 1000);
    gameInterval = setInterval("gamePlay()", GAME_INTERVAL);
    //monsterInterval= setInterval("monsterPlay()", GAME_INTERVAL);
    var monsters = svgdoc.getElementById("monsters");
    for (var i = 0; i < monsters.childNodes.length; i++) {
        var node = monsters.childNodes.item(i);
        monsterPlay(node);
    }    

    

    
    
}

function timePlay(){
    time--;
    svgdoc.getElementById("timeleft").firstChild.data=time;
    svgdoc.getElementById("timebar").setAttribute("width", time);

    if (time==0){
            svgdoc.getElementById("timeleft").firstChild.data=time;
            
            gameEnd();

            return;
    }
    
}

function monsterPlay(node){

                var x = parseInt(node.getAttribute("x"));
            var y = parseInt(node.getAttribute("y"));


               var nx= Math.floor(Math.random()*500) +40;
                var ny= Math.floor(Math.random()*500) +30; 
            
            node.setAttribute("nx", nx);
            node.setAttribute("ny", ny);
   
}

function moveMonster(node, x,y, nx, ny){
    // Go through all bullets
    
            if(x<nx)
                node.setAttribute("x", x + 1);
            else if(x>nx)
                node.setAttribute("x", x - 1);
            else if(x==nx)
                monsterPlay(node);

            if(y<ny)
                node.setAttribute("y", y + 1);
            else if(y>ny)
                node.setAttribute("y", y - 1);
            else if(y==ny)
                monsterPlay(node);
        
        
    }

function gameEnd(){


    cleanUpGroup("highscoretable", true);

    clearInterval(gameInterval);


    // Get the high score table from cookies
    var table = getHighScoreTable();
    // Create the new score record
    var record = new ScoreRecord(name,score);
    // Insert the new score record
    var pos = table.length;
    for (var i=0; i<table.length; i++){
        if (record.score>table[i].score){
            pos= i;
            break;
        }
    }
    table.splice(pos, 0, record);
    // Store the new high score table
    setHighScoreTable(table);
    // Show the high score table
    showHighScoreTable(table);
    clearInterval(timeInterval);

    var node= svgdoc.getElementById("nametracker");
    node.style.setProperty("visibility", "visible", null);


    if(time==0 && zoom==2.0){
        score+=time*2.0;
    }
    else if(time==0)
        score+=time;
    svgdoc.getElementById("playername").firstChild.data=name;
    svgdoc.getElementById("playerscore").firstChild.data=score;

    var node= svgdoc.getElementById("restart");
    node.style.setProperty("visibility", "visible", null);

    var monsters = svgdoc.getElementById("monsters");
    for (var i = 0; i < monsters.childNodes.length; i++) {
        var monster = monsters.childNodes.item(i);
        monsters.removeChild(monster);
        i--;

    }

    var goodthings = svgdoc.getElementById("goodthings");
    for (var i = 0; i < goodthings.childNodes.length; i++) {
        var goodthing = goodthings.childNodes.item(i);
        goodthings.removeChild(goodthing);
        i--;

    }

}


function restart(){
    fillername=name;

    
    if(zoom==2.0){
        setZoom();
    }
    else
    setNormal();



}


    








