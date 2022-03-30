const CAM_SP_INERT = .9;
const CAM_SC_INERT = .9;

const CELLSIZE_MAX = window.innerWidth/5;
const CELLSIZE_MIN = 0.1;

const FRTIME = 10;

class Info {
    constructor() {
        let cont = document.getElementById('cont');
        document.addEventListener("mouseleave", t => {this.mdown = false;});
        cont.addEventListener("mousemove", t => {this.move(t);});
        cont.addEventListener("mousedown", t => {this.down(t); this.click(t);});
        cont.addEventListener("mouseup", t => {this.up(t);});
        document.addEventListener("keypress", t => {this.kdown(t)});
        this.campos = new Vec2D(0,0);
        this.fld = new Field(20);
        this.camspeed = new Vec2D(0,0);
        this.camscale = 1;
        this.ticktime = 100;
        this.lasttick = 0;
        this.paused = false;
        this.mousePos = new Vec2D(0,0);
    }
    tick(ctx, frtime) {
        this.fld.draw(ctx, this.campos);
        let time = new Date;
        if (!this.paused && time - this.lasttick > this.ticktime) {
            this.fld.tick(ctx, this.campos);
            this.lasttick = time;
        }

        this.campos = this.campos.add(this.camspeed);
        this.camscale *= 1 + (1 - this.camscale)*(1 - CAM_SC_INERT);
        
        this.camspeed = this.camspeed.mult(CAM_SP_INERT);
        this.campos = this.campos.add(this.mousePos).mult(this.fld.scale(this.camscale)).subtr(this.mousePos);
    }
    move(mouse) {
        if(this.mdown) {
            let t = this.fld.coordsToCell(mouse.pageX, mouse.pageY, this.campos);
            this.fld.paintCell(t.x, t.y, this.fill);
        }
        this.mousePos = new Vec2D(mouse.pageX, mouse.pageY);
    }
    down(mouse) {
        let t = this.fld.coordsToCell(mouse.pageX, mouse.pageY, this.campos);
        this.fill = !this.fld.getCell(t.x, t.y);
        this.mdown = true;
    }
    up(mouse) {
        this.mdown = false;
    }
    click(mouse) {
        this.fld.click(mouse.pageX, mouse.pageY, this.campos);
    }
    kdown(key) {
        if(key.code == 'KeyW') this.camspeed.y = -10;
        if(key.code == 'KeyA') this.camspeed.x = -10;
        if(key.code == 'KeyS') this.camspeed.y = 10;
        if(key.code == 'KeyD') this.camspeed.x = 10;
        if(key.key == '+') this.camscale = 1.05;
        if(key.key == '-') this.camscale = 0.95;
        if(key.code == 'KeyE') this.ticktime = Math.max(this.ticktime * 0.8, 10);
        if(key.code == 'KeyQ') this.ticktime = Math.min(this.ticktime * 1.25, 5000);
        if(key.code == 'Space') this.paused = !this.paused;
        if(key.code == 'KeyC') this.fld.toggleCellsVisibility();
        if(key.code == 'KeyT') this.fld.stringify();
        if(key.code == 'KeyL') this.fld.load();
        if(key.code == 'KeyR') this.campos = new Vec2D(0,0);
    }
}
//FIELD
class Field {
    constructor(csize) {
        this.csize = csize;
        this.cells = new Map;
        this.drawCells = true;
    }
    stringify() {
        let str = JSON.stringify(this.cells);
        if(document.querySelector('#wn') == undefined)document.querySelector('body').insertAdjacentHTML('afterbegin', '<div class="wn" id="wn"><div class="wnhead"><div class="wnname">Saving</div><div class="wnclose" onclick="let t = document.querySelector(`#wn`); t.parentNode.removeChild(t)">X</div></div><div class="info"><input readonly value=' + str + '><button onclick="document.querySelector(`.wn > .info > input`).select(); document.execCommand(`copy`)">Copy</button></div></div>');
    }
    load() {
        if(document.querySelector('#wn') == undefined) {
            document.querySelector('body').insertAdjacentHTML('afterbegin', '<div class="wn" id="wn"><div class="wnhead"><div class="wnname">Loading</div><div class="wnclose" onclick="let t = document.querySelector(`#wn`); t.parentNode.removeChild(t)">X</div></div><div class="info"><input><button>Load</button></div></div>');
            document.querySelector(`.wn > .info > button`).addEventListener('click', () => {this.cells = JSON.parse(document.querySelector(`.wn > .info > input`).value)});
        }
    }
    tick(ctx, campos) {
        let neighbors = new Map;
        let ikeys = Object.keys(this.cells);
        ikeys.forEach(i => {
            let jkeys = Object.keys(this.cells[i]);
            jkeys.forEach(j => {
                if(neighbors[+i] == undefined) neighbors[+i] = new Map;
                if(neighbors[+i - 1] == undefined) neighbors[+i - 1] = new Map;
                if(neighbors[+i + 1] == undefined) neighbors[+i + 1] = new Map;
                neighbors[+i + 1][+j] = increase(neighbors[+i + 1][+j]);
                neighbors[+i + 1][+j + 1] = increase(neighbors[+i + 1][+j + 1]);
                neighbors[+i][+j + 1] = increase(neighbors[+i][+j + 1]);
                neighbors[+i - 1][+j + 1] = increase(neighbors[+i - 1][+j + 1]);
                neighbors[+i - 1][+j] = increase(neighbors[+i - 1][+j]);
                neighbors[+i - 1][+j - 1] = increase(neighbors[+i - 1][+j - 1]);
                neighbors[+i][+j - 1] = increase(neighbors[+i][+j - 1]);
                neighbors[+i + 1][+j - 1] = increase(neighbors[+i + 1][+j - 1]);
            });
        });
        ikeys.forEach(i => {
            let jkeys = Object.keys(this.cells[i]);
            jkeys.forEach(j => {
                if(neighbors[i][j] == undefined) this.clearCell(i, j);
            });
        });
        ikeys = Object.keys(neighbors);
        ikeys.forEach(i => {
            let jkeys = Object.keys(neighbors[i]);
            jkeys.forEach(j => {
                let t = this.cellToCoords(i, j, campos);
                if(neighbors[i][j] == 3) this.fillCell(i, j);
                else if(neighbors[i][j] != 2) this.clearCell(i, j);
            });
        });
    }
    scale(scl) {
        let old = this.csize;
        this.csize = Math.min((Math.max(this.csize * scl, CELLSIZE_MIN)), CELLSIZE_MAX);
        return this.csize / old;
    }
    draw(ctx, campos) {
        let ikeys = Object.keys(this.cells);
        ikeys.forEach(i => {
            let px = this.cellToX(i, campos);
            if(px > -this.csize && px < window.innerWidth) {
                let jkeys = Object.keys(this.cells[i]);
                ctx.fillStyle = '#000';
                jkeys.forEach(j => {
                    let py = this.cellToY(j, campos)
                    if(py > -this.csize && py < window.innerHeight) ctx.fillRect(i * this.csize - campos.x, j * this.csize - campos.y, this.csize, this.csize);
                });
            }
        });
        if(this.drawCells && this.csize > 2) {
            ctx.strokeStyle = '#999';
            for(let i = Math.floor(campos.y / this.csize) * this.csize - campos.y; i < window.innerHeight; i += this.csize) {
                drawLine(ctx, 0, i, window.innerWidth, i);
            }
            for(let i = Math.floor(campos.x / this.csize) * this.csize - campos.x; i < window.innerWidth; i += this.csize) {
                drawLine(ctx, i, 0, i, window.innerHeight);
            }
        }
    }
    fillCell(x, y) {
        if(this.cells[x] == undefined) {
            this.cells[x] = new Map;
        }
        this.cells[x][y] = true;
    }
    toggleCellsVisibility() {
        this.drawCells = !this.drawCells;
    }
    clearCell(x, y) {
        if(this.cells[x] != undefined) delete this.cells[x][y];
    }
    paintCell(x, y, color) {
        if(color) this.fillCell(x, y);
        else this.clearCell(x, y);
    }
    getCell(x, y) {
        return (this.cells[x] == undefined || this.cells[x][y] == undefined ? false : true);
    }
    invertCell(x, y) {
        if(this.getCell(x, y)) this.clearCell(x, y);
        else this.fillCell(x, y);
    }
    coordsToCell(x, y, campos) {
        return new Vec2D(Math.floor((x + campos.x)/this.csize), Math.floor((y + campos.y)/this.csize));
    }
    cellToX(x, campos) {
        return x * this.csize - campos.x;
    }
    cellToY(y, campos) {
        return y * this.csize - campos.y;
    }
    cellToCoords(x, y, campos) {
        return new Vec2D(x * this.csize - campos.x, y * this.csize - campos.y, this.csize, this.csize);
    }
    click(x, y, campos) {
        let t = this.coordsToCell(x, y, campos);
        this.invertCell(t.x, t.y);
    }
    move(x, y, campos, fill) {
        let t = this.coordsToCell(x, y, campos);
        if(fill) this.fillCell(t.x, t.y);
        else this.clearCell(t.x, t.y);
    }
}
//VECTOR
class Vec2D {
    draw(ctx, start) {
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(start.x + this.x, start.y + this.y);
        ctx.stroke();
    }
    add(vec) {
        return new Vec2D(this.x + vec.x, this.y + vec.y);
    }
    subtr(vec) {
        return new Vec2D(this.x - vec.x, this.y - vec.y);
    }
    diff(vec) {
        return new Vec2D(Math.abs(this.x - vec.x), Math.abs(this.y - vec.y));
    }
    mult(val) {
        return new Vec2D(this.x * val, this.y * val);
    }
    scalProd(vec) {
        return this.x * vec.x + this.y * vec.y;
    }
    div(val) {
        return new Vec2D(this.x / val, this.y / val);
    }
    len() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    norm() {
        return this.div(this.len());
    }
    proj(vec) {
        return this.scalProd(vec) / vec.len();
    }
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
//FUNCTIONS
function increase(val) {
    if(val == undefined) return 1;
    else return +val+1;
}
function drawLine(ctx, x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}
function switchBuffer(canvas) {
    //returns invisible canvas number
    if(canvas[0].getAttribute("style") == "") {
        canvas[0].setAttribute("style", "display: none");
        canvas[1].setAttribute("style", "");
        return 0;
    }
    else {
        canvas[0].setAttribute("style", "");
        canvas[1].setAttribute("style", "display: none");
        return 1;
    }
}
//MAIN AND PROCESS
function main() {
    let canvas = [document.querySelector('#main1'), document.querySelector('#main2')];
    let ctx = [canvas[0].getContext("2d"), canvas[1].getContext("2d")];
    let info = setup(canvas, ctx);
    process(canvas, ctx, 0, info);
}
function process(canvas, ctx, lastfrtime, info) {
    var start = new Date();
    let buff = switchBuffer(canvas);
    info = loop(canvas[buff], ctx[buff], Math.max(FRTIME, lastfrtime), info);
    var lastfrtime = new Date() - start;
    setTimeout(() => {
        process(canvas, ctx, lastfrtime, info);
    }, Math.max(0, FRTIME - lastfrtime));
}

//CODE
function setup(canvas, ctx) {
    return new Info();
}
function loop(canvas, ctx, frtime, info) {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    //fps
    document.title = 'FPS=' + (1000/frtime).toFixed(2);
    //canvas resizing
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    //tick
    info.tick(ctx, frtime);
    return info;
}