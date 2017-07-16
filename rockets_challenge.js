var count;
var target;
var numGenes;
var numRockets;
var lifeP;
var generation;
var successes;

function setup() {
  createCanvas(600, 600);
  count = 0;
  target = createVector(width/2, 25);
  numGenes = 150;
  numRockets = 50;
  cluster = new Cluster();
  generation = 0;
  successes = 0;
  lifeP = createP('');
}

function draw() {
  background(0);
  fill(255, 100, 100);
  ellipse(target.x, target.y, 10);
  rectMode(CENTER);
  fill(255);
  rect(150, 400, 400, 10);
  rect(450, 200, 400, 10);
  cluster.run();

  lifeP.html('Generation:' + generation + " Successes: " + successes + ' Frame ' + count);

  // Next Generation
  count++;
  if (count == numGenes) {
    count = 0;
    generation++;
    successes = 0;
    for (var i = 0; i < numRockets; i++) {
      if (cluster.rockets[i].finished) {
        successes += 1;
      }
    }

    cluster = new Cluster(cluster.rockets);
  }
}

function Rocket(genes) {
  this.pos = createVector(width/2, height);
  this.vel = createVector(0, -1);
  this.acc = createVector(0, 0);
  this.fitness = 600;

  this.finished = false;
  this.crashed = false;

  // Take in evolved genes
  if (genes){
    this.dna = new DNA(genes);
  } else {
    this.dna = new DNA();
  }

  this.show = function() {
    rectMode(CENTER);
    fill(255, 100);

    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());
    rect(0, 0, 25, 5);
    pop();
  }

  this.update = function() {
    if (!this.finished && !this.crashed) {
      this.pos.add(this.vel);
      this.vel.add(this.acc);
      this.vel.limit(10);
      this.acc.mult(0);

      this.applyForce(this.dna.genes[count]);
    }

    // Crash
    if (this.pos.x < 0 || this.pos.x > width || this.pos.y < 0 || this.pos.y > height){
      this.crashed = true;
    }
    if (this.pos.x > 250 && this.pos.y < 205 && this.pos.y > 195){
      this.crashed = true;
    }
    if (this.pos.x < 350 && this.pos.y < 405 && this.pos.y > 395){
      this.crashed = true;
    }

    // Finish
    if (dist(this.pos.x, this.pos.y, target.x, target.y) < 7.5) {
      this.finished = true;
      this.fitness = 0; 
      //noLoop();
    }

    // Calculate fitness
    if (this.fitness > dist(this.pos.x, this.pos.y, target.x, target.y)) {
      this.fitness = dist(this.pos.x, this.pos.y, target.x, target.y);
    }
  }

  this.applyForce = function(force) {
    this.acc.add(force);
  }
}

function DNA(genes) {
  this.genes = [];
  if (genes) {
    this.genes = genes;
  } else {
    for (var i = 0; i < 200; i++) {
      this.genes[i] = createVector(random(-1, 1), random(-1, 1));
    }
  }
}

function Cluster(rockets) {
  this.rockets = [];
  this.newDNA = [];

  // Evolve genes
  this.geneShuffle = function() {
    // Find best fitness
    var bestFitnessIndex = 0;
    for (var i = 0; i < numRockets; i++) {
      if (rockets[i].fitness < rockets[bestFitnessIndex].fitness) {
        bestFitnessIndex = i;
      }
    }
    // Save best fitnesses
    maxDuplicates = numRockets/2;
    for (var i = 0; i < numRockets; i++) {
      if (rockets[i].fitness == rockets[bestFitnessIndex].fitness) {
        this.newDNA.push(rockets[i].dna.genes);
        maxDuplicates -= 1;
      } else if ((rockets[bestFitnessIndex].fitness != 0) && (rockets[i].fitness < rockets[bestFitnessIndex].fitness + 50) && (maxDuplicates > 0)) {
        this.newDNA.push(rockets[i].dna.genes);
        maxDuplicates -= 1;
      }
    }
    // Mate
    var len = this.newDNA.length;
    for (var i = 0; i < numRockets - len; i++) {
      var newGenes = [];
      var parent1 = this.newDNA[floor(random(len))];
      var parent2 = rockets[floor(random(numRockets))].dna.genes;
      for (var j = 0; j < numGenes; j++) {
        var r = random();
        if (r < .48) {
          newGenes.push(parent1[j]);
        } else if (r < .96) {
          newGenes.push(parent2[j]);
        } else {
          newGenes.push(createVector(random(-1, 1), random(-1, 1)));
        }
      }
      this.newDNA.push(newGenes);
    }

  }

  // Pass down evolved genes
  if (rockets) {
    this.geneShuffle();
    for (var i = 0; i < numRockets; i++) {
      this.rockets.push(new Rocket(this.newDNA[i]));
    }
  // Create rockets from scratch
  } else {
    for (var i = 0; i < numRockets; i++) {
      this.rockets.push(new Rocket());
    }
  }

  this.run = function() {
    for (var i = 0; i < numRockets; i++) {
      this.rockets[i].show();
      this.rockets[i].update();
    }
  }
}











