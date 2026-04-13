let seaweeds = [];
let bubbles = [];
let fishes = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // 初始化海草 (Class & Array)
  for (let i = 0; i < 15; i++) {
    seaweeds.push(new Seaweed(random(width), height));
  }

  // 初始化五週作品的觸發氣泡
  bubbles.push(new ProjectBubble(width * 0.15, height * 0.6, "第一週", "week1/index.html"));
  bubbles.push(new ProjectBubble(width * 0.35, height * 0.4, "第二週", "week2/index.html"));
  bubbles.push(new ProjectBubble(width * 0.55, height * 0.7, "第三週", "week3/index.html"));
  bubbles.push(new ProjectBubble(width * 0.75, height * 0.3, "第四週", "week4/index.html"));
  bubbles.push(new ProjectBubble(width * 0.90, height * 0.5, "第五週", "week5/index.html"));

  // 初始化奇幻魚群
  for (let i = 0; i < 5; i++) {
    fishes.push(new FantasyFish());
  }
}

function draw() {
  // 水底漸層背景效果
  background(0, 27, 68);
  noStroke();
  fill(0, 50, 100, 150);
  rect(0, 0, width, height);

  // 繪製海草
  for (let sw of seaweeds) {
    sw.sway();
    sw.display();
  }

  // 繪製魚群 (使用 Vertex)
  for (let fish of fishes) {
    fish.swim();
    fish.display();
  }

  // 繪製氣泡
  for (let b of bubbles) {
    b.float();
    b.display();
  }
}

// 海草類別
class Seaweed {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.segments = floor(random(10, 20));
    this.segHeight = random(12, 18);
    this.angleOffset = random(TWO_PI);
    this.w = random(4, 10);
    // 優化：隨機顏色（不同深淺的綠、青與棕色）
    this.color = color(random(20, 60), random(100, 180), random(50, 130), 200);
    this.swaySpeed = random(0.01, 0.03);

    // 初始化分叉數據
    this.branches = [];
    if (random() > 0.5) { // 50% 機率產生分叉
      let numBranches = floor(random(1, 3));
      for (let i = 0; i < numBranches; i++) {
        this.branches.push({
          startIdx: floor(random(3, this.segments - 3)),
          angle: random(-QUARTER_PI, QUARTER_PI),
          len: floor(random(5, 10))
        });
      }
    }
  }

  sway() {
    this.angleOffset += this.swaySpeed;
  }

  display() {
    push();
    translate(this.x, this.y);
    stroke(this.color);
    strokeWeight(this.w);
    noFill();

    // 繪製主幹
    this.drawStem(this.segments, 0);

    // 繪製分叉
    for (let b of this.branches) {
      // 計算分叉起點的動態座標（相對於海草底部）
      let bx = sin(this.angleOffset + b.startIdx * 0.3) * b.startIdx * 2;
      let by = -b.startIdx * this.segHeight;
      
      push();
      translate(bx, by);
      rotate(b.angle);
      strokeWeight(this.w * 0.6); // 分叉稍微細一點
      this.drawStem(b.len, b.startIdx);
      pop();
    }
    pop();
  }

  drawStem(len, offset) {
    beginShape();
    vertex(0, 0);
    for (let i = 1; i < len; i++) {
      let currentIdx = i + offset;
      // 計算相對位移，確保曲線平滑連接
      let dx = (sin(this.angleOffset + currentIdx * 0.3) * currentIdx * 2) - (sin(this.angleOffset + offset * 0.3) * offset * 2);
      let dy = -i * this.segHeight;
      curveVertex(dx, dy);
    }
    endShape();
  }
}

// 奇幻魚類別 (使用 Vertex)
class FantasyFish {
  constructor() {
    this.pos = createVector(random(width), random(height * 0.2, height * 0.8));
    this.vel = createVector(random(-2, -1), random(-0.5, 0.5));
    this.size = random(0.5, 1.2);
    this.color = color(random(100, 255), random(150, 255), 255, 180);
  }

  swim() {
    this.pos.add(this.vel);
    if (this.pos.x < -100) this.pos.x = width + 100;
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y);
    scale(this.size);
    if (this.vel.x > 0) scale(-1, 1); // 轉向
    fill(this.color);
    noStroke();
    
    // 使用 vertex 勾勒魚的身形
    beginShape();
    vertex(40, 0);   // 魚頭
    vertex(0, -15);  // 背部
    vertex(-30, -5); // 尾部上
    vertex(-45, -15);// 魚尾尖
    vertex(-35, 0);  // 尾部中
    vertex(-45, 15); // 魚尾下
    vertex(-30, 5);  // 腹部後
    vertex(0, 15);   // 腹部前
    endShape(CLOSE);
    
    // 眼睛
    fill(255);
    ellipse(25, -2, 5, 5);
    pop();
  }
}

// 作品氣泡類別
class ProjectBubble {
  constructor(x, y, label, url) {
    this.x = x;
    this.y = y;
    this.label = label;
    this.url = url;
    this.r = 60;
    this.displayR = 60; // 新增：用於動畫縮放的變數
    this.offset = random(TWO_PI);
  }

  float() {
    this.y += sin(frameCount * 0.05 + this.offset) * 0.5;
  }

  display() {
    // 1. 偵測滑鼠距離氣泡中心的距離
    let d = dist(mouseX, mouseY, this.x, this.y);
    let isHovered = d < this.r;

    // 2. 縮放邏輯：靠近時目標半徑變大 (1.3倍)，遠離時恢復
    let targetR = isHovered ? this.r * 1.3 : this.r;
    this.displayR = lerp(this.displayR, targetR, 0.1); // 使用 lerp 讓縮放更平滑

    push();
    if (isHovered) {
      // 3. 發光效果：增加填充亮度、邊框寬度，並利用 drawingContext 添加陰影發光
      fill(255, 255, 255, 100);
      stroke(255, 255, 255, 255);
      strokeWeight(3);
      drawingContext.shadowBlur = 20; 
      drawingContext.shadowColor = 'white';
    } else {
      fill(255, 255, 255, 50);
      stroke(255, 255, 255, 150);
      strokeWeight(1);
    }

    ellipse(this.x, this.y, this.displayR * 2);

    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(isHovered ? 14 : 12); // 文字也稍微變大
    text(this.label, this.x, this.y);
    pop();
  }

  checkClick() {
    let d = dist(mouseX, mouseY, this.x, this.y);
    if (d < this.r) {
      showProject(this.url);
    }
  }
}

function mousePressed() {
  for (let b of bubbles) {
    b.checkClick();
  }
}

function showProject(url) {
  document.getElementById('project-frame').src = url;
  document.getElementById('portfolio-overlay').style.display = 'flex';
}

function closeProject() {
  document.getElementById('portfolio-overlay').style.display = 'none';
  document.getElementById('project-frame').src = '';
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}