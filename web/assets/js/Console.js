class Chess {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext("2d");
        this.lineWidth = 2;
        this.lineColor = '#333';
        this.hintLineWidth = 1;
        this.hintLineColor = '#0F0';

        this.initCanvas();
        this.resetData();
    }

    //初始化canvas并绑定点击事件
    initCanvas() {
        let body = document.body;
        let w = body.clientWidth;
        let h = body.clientHeight;

        if (h > w) {
            this.cellWidth = w / 5;
            this.cellHeight = h / 5;
        } else {
            this.cellHeight = h / 5;
            this.cellWidth = this.cellHeight * 3 / 4;
        }

        this.width = this.cellWidth * 5;
        this.height = this.cellHeight * 5;

        this.canvas.width = this.width;
        this.canvas.height = this.height;

        //绑定点击事件
        this.canvas.addEventListener("click", (e) => {
            var offset = this.canvas.getBoundingClientRect();
            var x = Math.round((e.clientX - offset.left - this.cellWidth) / this.cellWidth);
            var y = Math.round((e.clientY - offset.top - this.cellHeight) / this.cellHeight);

            if (x >= 0 && x <= 3 && y >= 0 && y <= 3) {
                //是否无待移动棋子
                if (this.toMove == undefined) {
                    //点击区域是否无棋子
                    if (this.pieces[x][y] == undefined) {
                        //无操作
                    } else {
                        //该棋子是否已翻开
                        if (this.pieces[x][y].isOpen) {
                            //是否选中己方棋子
                            if (this.active == this.pieces[x][y].camp) {
                                this.toMove = this.pieces[x][y];
                                this.drawFrame(this.cellWidth * x, this.cellHeight * y, this.cellWidth, this.cellHeight, this.hintLineWidth, this.hintLineColor);
                            } else {
                                //无操作
                            }
                        } else {
                            this.openPiece(x, y);
                        }
                    }
                } else {
                    this.drawFrame(this.cellWidth * this.toMove.x, this.cellHeight * this.toMove.y, this.cellWidth, this.cellHeight, this.lineWidth, this.lineColor);
                    if (this.isRange(x, y)) {
                        //是否无棋子
                        if (this.pieces[x][y] == undefined) {
                            this.movePiece(x, y);
                        } else {
                            //是否未翻开
                            if (this.pieces[x][y].isOpen) {
                                //是否己方
                                if (this.pieces[x][y].camp == this.active) {
                                    this.toMove = undefined;
                                } else {
                                    if (this.isEat(x, y)) {
                                        this.eatPiece(x, y);
                                    } else {
                                        this.toMove = undefined;
                                    }
                                }

                            } else {
                                this.toMove = undefined;
                            }
                        }
                        this.isOver();
                    } else {
                        this.toMove = undefined;
                    }
                }
                this.disInf();
            } else {
            }
        }, false);
    }

    //重置数据，再来一局
    resetData() {
        this.active = undefined; //当前走棋方：0或1，第一次翻棋后确定初始值
        this.left0 = [0, 1, 2, 3, 4, 5, 6, 7];
        this.left1 = [0, 1, 2, 3, 4, 5, 6, 7];
        this.toMove = undefined; //待移动棋子

        this.initChessBoard();
        this.initPieces();
        this.drawPieces();
    }

    //初始化棋局
    initPieces() {
        this.pieces = [];
        this.pieces[0] = [];
        this.pieces[1] = [];
        this.pieces[2] = [];
        this.pieces[3] = [];

        var position_index = [];
        var pieces_index = [];

        while (position_index.length < 16) {
            //随机选择一个位置
            var x = this.getRandom(3);
            var y = this.getRandom(3);
            if (position_index.includes(x + ',' + y)) {
                continue;
            }

            //随机选择一个棋子
            var camp = this.getRandom(1);
            var value = this.getRandom(7);
            if (pieces_index.includes(camp + ',' + value)) {
                continue;
            }

            this.pieces[x][y] = new Piece(x, y, camp, value, './assets/img/pieces/back.jpg', false);
            position_index.push(x + ',' + y);
            pieces_index.push(camp + ',' + value);
        }
    }

    //画棋盘
    initChessBoard() {
        //设置全局属性
        this.ctx.translate((this.canvas.width - this.cellWidth * 4 - this.lineWidth * 5) / 2, (this.canvas.height - this.cellHeight * 4 - this.lineWidth * 5) / 2);
        this.ctx.beginPath();

        //画横线
        for (let i = 0; i < 5; i++) {
            this.ctx.moveTo(0, this.cellHeight * i);
            this.ctx.lineTo(this.cellWidth * 4, this.cellHeight * i);
        }

        //画纵线
        for (let i = 0; i < 5; i++) {
            this.ctx.moveTo(this.cellWidth * i, 0);
            this.ctx.lineTo(this.cellWidth * i, this.cellHeight * 4);
        }

        this.ctx.strokeStyle = this.lineColor;
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.stroke();

        this.ctx.restore();
    }

    //画所有的棋子
    drawPieces() {
        for (let c = 0; c < 4; c++) {
            for (let r = 0; r < 4; r++) {
                if (this.pieces[c][r] != undefined) {
                    this.drawOnePiece(c, r, this.pieces[c][r].imgPath, 0);
                }
            }
        }
    }

    //画一个棋子
    drawOnePiece(x, y, imgPath, text) {
        var x = this.cellWidth * x;
        var y = this.cellHeight * y;

        var image = new Image();
        var ctx = this.ctx;
        var imgX = x + this.lineWidth;
        var imgY = y + this.lineWidth;
        var imgWidth = this.cellWidth - this.lineWidth * 2;
        3
        var imgHeight = this.cellHeight - this.lineWidth * 2;
        image.onload = function () {
            ctx.drawImage(image, imgX, imgY, imgWidth, imgHeight);
        }
        image.src = imgPath;
    }

    //判断该区域是否可选择
    isRange(x, y) {
        //原地踏步
        if (x == this.toMove.x && y == this.toMove.y) {
            return false;
        }

        //三飞虎四飞豹单独处理
        if (this.toMove.value == 2 || this.toMove.value == 3) {
            if (x == this.toMove.x) {
                if (y < this.toMove.y) {
                    for (let i = this.toMove.y - 1; y < i; i--) {
                        if (this.pieces[x][i] != undefined) {
                            return false;
                        }
                    }

                    return true;
                } else if (y > this.toMove.y) {
                    for (let i = this.toMove.y + 1; i < y; i++) {
                        if (this.pieces[x][i] != undefined) {
                            return false;
                        }
                    }

                    return true;
                }
            }

            if (y == this.toMove.y) {
                if (x < this.toMove.x) {
                    for (let i = this.toMove.x - 1; x < i; i--) {
                        if (this.pieces[i][y] != undefined) {
                            return false;
                        }
                    }

                    return true;
                } else if (x > this.toMove.x) {
                    for (let i = this.toMove.x + 1; i < x; i++) {
                        if (this.pieces[i][y] != undefined) {
                            return false;
                        }
                    }

                    return true;
                }
            }
        }

        if ((x - this.toMove.x == 1 || x - this.toMove.x == -1) && y == this.toMove.y) {//横走
            return true;
        } else if ((y - this.toMove.y == 1 || y - this.toMove.y == -1) && x == this.toMove.x) {//竖走
            return true;
        } else {
            return false;
        }
    }

    //画边框
    drawFrame(x, y, width, height, lineWidth, lineColor) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);

        this.ctx.lineTo(x + width, y);
        this.ctx.lineTo(x + width, y + height);
        this.ctx.lineTo(x, y + height);
        this.ctx.lineTo(x, y);

        this.ctx.strokeStyle = lineColor;
        this.ctx.lineWidth = lineWidth;
        this.ctx.stroke();

        this.ctx.restore();
    }

    //翻开棋子
    openPiece(x, y) {
        this.pieces[x][y].imgPath = './assets/img/pieces/' + this.pieces[x][y].camp + '-' + this.pieces[x][y].value + '.png';//'https://t7.baidu.com/it/u=1956604245,3662848045&fm=193&f=GIF';
        this.pieces[x][y].isOpen = true;

        this.drawOnePiece(x, y, this.pieces[x][y].imgPath, this.pieces[x][y].camp + ',' + this.pieces[x][y].value);
        this.drawOnePiece(x, y, this.pieces[x][y].imgPath, this.pieces[x][y].camp + ',' + this.pieces[x][y].value);

        if (this.active == undefined) {
            this.active = this.pieces[x][y].camp;
        }
        this.active = (this.active + 1) % 2;
    }

    //移动棋子
    movePiece(x, y) {
        this.drawOnePiece(x, y, this.toMove.imgPath, this.toMove.camp + ',' + this.toMove.value);
        this.pieces[x][y] = new Piece(x, y, this.toMove.camp, this.toMove.value, this.toMove.imgPath, this.toMove.isOpen);

        this.deletePiece(this.toMove.x, this.toMove.y);
        this.active = (this.active + 1) % 2;
        this.toMove = undefined;
    }

    //吃棋
    eatPiece(x, y) {
        if (this.active == 0) {
            delete this.left1[this.pieces[x][y].value];
        } else {
            delete this.left0[this.pieces[x][y].value];
        }

        this.deletePiece(x, y);
        this.movePiece(x, y);
    }

    //删除棋子
    deletePiece(x, y) {
        this.ctx.clearRect(x * this.cellWidth + this.ctx.lineWidth, y * this.cellHeight + this.ctx.lineWidth, this.cellWidth - this.ctx.lineWidth * 2, this.cellHeight - this.ctx.lineWidth * 2);
        delete this.pieces[x][y];
    }

    //判断是否可吃
    isEat(x, y) {
        //己方象，敌方鼠
        if (this.toMove.value == 0 && this.pieces[x][y].value == 7) {
            return false;
        }

        //己方鼠，敌方象
        if (this.toMove.value == 7 && this.pieces[x][y].value == 0) {
            return true;
        }

        if (this.toMove.value < this.pieces[x][y].value) {
            return true;
        } else {
            return false;
        }
    }

    //判断对局是否结束，走棋后走棋方已变！！！
    isOver() {
        let leftValue = this.isEmpty(this.active);
        if (leftValue == -1) {
            let color;
            //走棋方无棋子，对方胜
            if ((this.active + 1) % 2 == 0) {
                color = "红";
            } else {
                color = "蓝";
            }
            alert(color + "棋胜");
            this.isReset();
        } else {
            if (leftValue != -2) {
                //走棋方仅剩一枚棋子
                let myLeft = this.isEmpty((this.active + 1) % 2);
                if (myLeft != -2) {
                    //双方各仅剩余一枚棋子
                    if (leftValue == myLeft) {
                        alert("平局");
                        this.isReset();
                    }
                }
            }
        }
    }

    //判断是否剩余棋子
    isEmpty(camp) {
        let left;
        if (camp == 0) {
            left = this.left0;
        } else {
            left = this.left1;
        }
        let leftValue;
        let leftNum = 0;

        for (let i = 0; i < 8; i++) {
            if (left[i] != undefined) {
                if (leftNum == 1) {
                    //非空且剩余个数大于1，返回 -2
                    return -2;
                } else {
                    leftNum = 1;
                    leftValue = left[i];
                }
            }
        }

        if (leftNum == 1) {
            //剩余1个，返回剩余棋子值
            return leftValue;
        } else {
            //空，返回-1
            return -1;
        }
    }

    //显示走棋方
    disInf() {
        let color;
        if (this.active == 0) {
            color = "红";
        } else {
            color = "蓝";
        }
        document.getElementById("information").innerText = color + "棋走";
    }

    //结束后是否重开一局
    isReset() {
        var con = confirm("再来一局？");
        if (con) {
            this.ctx.translate(-(this.canvas.width - this.cellWidth * 4 - this.lineWidth * 5) / 2, -(this.canvas.height - this.cellHeight * 4 - this.lineWidth * 5) / 2);
            document.getElementById("information").innerText = "翻棋";
            this.resetData();
        } else {
            window.close();
        }
    }

    //生成随机数
    getRandom(max) {
        return parseInt((Math.random() * 10) % (max + 1), 10);
    }
}

class Piece {
    constructor(x, y, camp, value, imgPath, isOpen) {
        this.x = x;
        this.y = y;
        this.camp = camp;
        this.value = value;
        this.imgPath = imgPath;
        this.isOpen = isOpen;
    }
}